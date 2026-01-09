import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Json } from "@/integrations/supabase/types";

export interface SetData {
  setNumber: number;
  reps: number;
  weight: number;
  completed: boolean;
  notes?: string;
}

export interface WorkoutLogExercise {
  id: string;
  workout_log_id: string;
  exercise_id: string | null;
  exercise_name: string;
  sets_completed: number;
  set_data: SetData[] | null;
  notes: string | null;
  order_index: number;
  created_at: string;
  exercise?: {
    id: string;
    name: string;
    primary_muscle: string;
    equipment: string;
  } | null;
}

export interface WorkoutLog {
  id: string;
  client_id: string;
  template_id: string | null;
  template_day_id: string | null;
  assignment_id: string | null;
  workout_date: string;
  started_at: string | null;
  completed_at: string | null;
  duration_minutes: number | null;
  status: string;
  notes: string | null;
  perceived_effort: number | null;
  satisfaction_rating: number | null;
  created_at: string;
  updated_at: string;
  workout_template?: {
    id: string;
    name: string;
    description: string | null;
  } | null;
  template_day?: {
    id: string;
    name: string;
    day_number: number;
  } | null;
  exercises?: WorkoutLogExercise[];
}

export function useWorkoutLogs(clientId?: string) {
  const { user } = useAuth();
  const targetId = clientId || user?.id;

  return useQuery({
    queryKey: ["workout-logs", targetId],
    queryFn: async () => {
      if (!targetId) return [];

      const { data, error } = await supabase
        .from("workout_logs")
        .select(`
          *,
          workout_template:workout_templates(id, name, description),
          template_day:workout_template_days(id, name, day_number)
        `)
        .eq("client_id", targetId)
        .order("workout_date", { ascending: false });

      if (error) throw error;
      return data as WorkoutLog[];
    },
    enabled: !!targetId,
  });
}

export function useWorkoutLogDetail(logId: string | null) {
  return useQuery({
    queryKey: ["workout-log-detail", logId],
    queryFn: async () => {
      if (!logId) return null;

      const { data: log, error: logError } = await supabase
        .from("workout_logs")
        .select(`
          *,
          workout_template:workout_templates(id, name, description),
          template_day:workout_template_days(id, name, day_number)
        `)
        .eq("id", logId)
        .single();

      if (logError) throw logError;

      const { data: exercises, error: exercisesError } = await supabase
        .from("workout_log_exercises")
        .select(`
          *,
          exercise:exercises(id, name, primary_muscle, equipment)
        `)
        .eq("workout_log_id", logId)
        .order("order_index");

      if (exercisesError) throw exercisesError;

      return {
        ...log,
        exercises: exercises.map(e => ({
          ...e,
          set_data: Array.isArray(e.set_data) ? e.set_data as unknown as SetData[] : null
        }))
      } as WorkoutLog;
    },
    enabled: !!logId,
  });
}

export function useCreateWorkoutLog() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      templateId,
      templateDayId,
      assignmentId,
      workoutDate,
      preloadExercises = true,
    }: {
      templateId?: string;
      templateDayId?: string;
      assignmentId?: string;
      workoutDate?: string;
      preloadExercises?: boolean;
    }) => {
      if (!user?.id) throw new Error("Not authenticated");

      // Create the workout log
      const { data: log, error: logError } = await supabase
        .from("workout_logs")
        .insert({
          client_id: user.id,
          template_id: templateId || null,
          template_day_id: templateDayId || null,
          assignment_id: assignmentId || null,
          workout_date: workoutDate || new Date().toISOString().split('T')[0],
          started_at: new Date().toISOString(),
          status: "in_progress",
        })
        .select()
        .single();

      if (logError) throw logError;

      // If we have a template and want to preload exercises, get the template day exercises
      if (templateId && preloadExercises) {
        // First find the next workout day based on the template
        // For now, we'll get the first day's exercises if no specific day is provided
        let dayId = templateDayId;
        
        if (!dayId) {
          // Get days for this template, ordered by day_number
          const { data: days } = await supabase
            .from("workout_template_days")
            .select("id, day_number, name")
            .eq("template_id", templateId)
            .order("day_number")
            .limit(1);
          
          if (days && days.length > 0) {
            dayId = days[0].id;
            
            // Update the log with the day_id
            await supabase
              .from("workout_logs")
              .update({ template_day_id: dayId })
              .eq("id", log.id);
          }
        }

        if (dayId) {
          // Get exercises for this day
          const { data: templateExercises } = await supabase
            .from("workout_template_exercises")
            .select(`
              id,
              exercise_id,
              custom_exercise_name,
              sets_min,
              reps_min,
              reps_max,
              order_index,
              notes,
              exercise:exercises(id, name)
            `)
            .eq("day_id", dayId)
            .order("order_index");

          if (templateExercises && templateExercises.length > 0) {
            // Create workout log exercises based on template
            const exercisesToInsert = templateExercises.map((te, index) => {
              const exerciseName = te.exercise?.name || te.custom_exercise_name || "Unknown Exercise";
              
              // Create initial set data based on template's sets_min
              const initialSets: Json[] = [];
              for (let i = 0; i < te.sets_min; i++) {
                initialSets.push({
                  setNumber: i + 1,
                  reps: te.reps_min,
                  weight: 0,
                  completed: false,
                });
              }

              return {
                workout_log_id: log.id,
                exercise_id: te.exercise_id,
                exercise_name: exerciseName,
                order_index: te.order_index || index,
                sets_completed: 0,
                set_data: initialSets,
                notes: te.notes,
              };
            });

            await supabase
              .from("workout_log_exercises")
              .insert(exercisesToInsert);
          }
        }
      }

      return log;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workout-logs"] });
    },
  });
}

export function useUpdateWorkoutLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: string;
      status?: string;
      completed_at?: string;
      duration_minutes?: number;
      notes?: string;
      perceived_effort?: number;
      satisfaction_rating?: number;
    }) => {
      const { data, error } = await supabase
        .from("workout_logs")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["workout-logs"] });
      queryClient.invalidateQueries({ queryKey: ["workout-log-detail", variables.id] });
    },
  });
}

export function useAddWorkoutExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      workoutLogId,
      exerciseId,
      exerciseName,
      orderIndex,
    }: {
      workoutLogId: string;
      exerciseId?: string;
      exerciseName: string;
      orderIndex: number;
    }) => {
      const { data, error } = await supabase
        .from("workout_log_exercises")
        .insert({
          workout_log_id: workoutLogId,
          exercise_id: exerciseId || null,
          exercise_name: exerciseName,
          order_index: orderIndex,
          sets_completed: 0,
          set_data: [] as unknown as Json,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["workout-log-detail", variables.workoutLogId] });
    },
  });
}

export function useUpdateWorkoutExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      workoutLogId,
      setsCompleted,
      setData,
      notes,
    }: {
      id: string;
      workoutLogId: string;
      setsCompleted?: number;
      setData?: SetData[];
      notes?: string;
    }) => {
      const updates: Record<string, unknown> = {};
      if (setsCompleted !== undefined) updates.sets_completed = setsCompleted;
      if (setData !== undefined) updates.set_data = setData as unknown as Json;
      if (notes !== undefined) updates.notes = notes;

      const { data, error } = await supabase
        .from("workout_log_exercises")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["workout-log-detail", variables.workoutLogId] });
    },
  });
}

export function useDeleteWorkoutLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Delete exercises first
      await supabase
        .from("workout_log_exercises")
        .delete()
        .eq("workout_log_id", id);

      const { error } = await supabase
        .from("workout_logs")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workout-logs"] });
    },
  });
}

export function useWorkoutStats(clientId?: string) {
  const { user } = useAuth();
  const targetId = clientId || user?.id;

  return useQuery({
    queryKey: ["workout-stats", targetId],
    queryFn: async () => {
      if (!targetId) return null;

      // Get this week's workouts
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const { data: weekWorkouts, error: weekError } = await supabase
        .from("workout_logs")
        .select("id, status, duration_minutes")
        .eq("client_id", targetId)
        .gte("workout_date", startOfWeek.toISOString().split('T')[0])
        .eq("status", "completed");

      if (weekError) throw weekError;

      // Get streak (consecutive days with workouts)
      const { data: recentLogs, error: streakError } = await supabase
        .from("workout_logs")
        .select("workout_date")
        .eq("client_id", targetId)
        .eq("status", "completed")
        .order("workout_date", { ascending: false })
        .limit(30);

      if (streakError) throw streakError;

      let streak = 0;
      if (recentLogs.length > 0) {
        const today = new Date().toISOString().split('T')[0];
        const dates = [...new Set(recentLogs.map(l => l.workout_date))];
        
        for (let i = 0; i < dates.length; i++) {
          const checkDate = new Date();
          checkDate.setDate(checkDate.getDate() - i);
          const checkDateStr = checkDate.toISOString().split('T')[0];
          
          if (dates.includes(checkDateStr)) {
            streak++;
          } else if (i > 0) {
            break;
          }
        }
      }

      // Get total workouts
      const { count: totalWorkouts } = await supabase
        .from("workout_logs")
        .select("*", { count: "exact", head: true })
        .eq("client_id", targetId)
        .eq("status", "completed");

      return {
        workoutsThisWeek: weekWorkouts?.length || 0,
        totalMinutesThisWeek: weekWorkouts?.reduce((acc, w) => acc + (w.duration_minutes || 0), 0) || 0,
        currentStreak: streak,
        totalWorkouts: totalWorkouts || 0,
      };
    },
    enabled: !!targetId,
  });
}
