import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { subDays, startOfWeek, format, parseISO, differenceInDays } from "date-fns";

export interface WorkoutAnalytics {
  // Weekly volume data
  weeklyVolume: {
    week: string;
    totalSets: number;
    totalReps: number;
    totalWeight: number;
  }[];
  // Workout frequency
  weeklyFrequency: {
    week: string;
    workouts: number;
  }[];
  // Muscle group distribution
  muscleDistribution: {
    muscle: string;
    count: number;
  }[];
  // Progress over time (PRs)
  progressMetrics: {
    totalWorkouts: number;
    avgWorkoutDuration: number;
    avgExercisesPerWorkout: number;
    currentStreak: number;
    longestStreak: number;
    mostActiveDay: string;
  };
}

export function useWorkoutAnalytics(days = 90) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["workout-analytics", user?.id, days],
    queryFn: async (): Promise<WorkoutAnalytics> => {
      if (!user?.id) throw new Error("Not authenticated");

      const startDate = subDays(new Date(), days).toISOString().split("T")[0];

      // Get all completed workouts with exercises
      const { data: workouts, error: workoutsError } = await supabase
        .from("workout_logs")
        .select(`
          id,
          workout_date,
          duration_minutes,
          status
        `)
        .eq("client_id", user.id)
        .eq("status", "completed")
        .gte("workout_date", startDate)
        .order("workout_date", { ascending: true });

      if (workoutsError) throw workoutsError;

      // Get exercises for these workouts
      const workoutIds = workouts?.map((w) => w.id) || [];
      let exerciseLogs: any[] = [];
      if (workoutIds.length > 0) {
        const { data: exercises, error: exercisesError } = await supabase
          .from("workout_log_exercises")
          .select(`
            *,
            exercise:exercises(primary_muscle)
          `)
          .in("workout_log_id", workoutIds);

        if (exercisesError) throw exercisesError;
        exerciseLogs = exercises || [];
      }

      // Calculate weekly volume
      const weeklyVolumeMap = new Map<string, { sets: number; reps: number; weight: number }>();
      
      workouts?.forEach((workout) => {
        const weekStart = format(startOfWeek(parseISO(workout.workout_date)), "yyyy-MM-dd");
        const workoutExercises = exerciseLogs.filter((e) => e.workout_log_id === workout.id);
        
        let sets = 0;
        let reps = 0;
        let weight = 0;

        workoutExercises.forEach((ex) => {
          const setData = Array.isArray(ex.set_data) ? ex.set_data : [];
          sets += setData.filter((s: any) => s.completed).length;
          setData.forEach((s: any) => {
            if (s.completed) {
              reps += s.reps || 0;
              weight += (s.weight || 0) * (s.reps || 0);
            }
          });
        });

        const existing = weeklyVolumeMap.get(weekStart) || { sets: 0, reps: 0, weight: 0 };
        weeklyVolumeMap.set(weekStart, {
          sets: existing.sets + sets,
          reps: existing.reps + reps,
          weight: existing.weight + weight,
        });
      });

      const weeklyVolume = Array.from(weeklyVolumeMap.entries()).map(([week, data]) => ({
        week: format(parseISO(week), "MMM d"),
        totalSets: data.sets,
        totalReps: data.reps,
        totalWeight: Math.round(data.weight),
      }));

      // Calculate weekly frequency
      const weeklyFrequencyMap = new Map<string, number>();
      workouts?.forEach((workout) => {
        const weekStart = format(startOfWeek(parseISO(workout.workout_date)), "yyyy-MM-dd");
        weeklyFrequencyMap.set(weekStart, (weeklyFrequencyMap.get(weekStart) || 0) + 1);
      });

      const weeklyFrequency = Array.from(weeklyFrequencyMap.entries()).map(([week, count]) => ({
        week: format(parseISO(week), "MMM d"),
        workouts: count,
      }));

      // Calculate muscle distribution
      const muscleMap = new Map<string, number>();
      exerciseLogs.forEach((ex) => {
        const muscle = ex.exercise?.primary_muscle || "other";
        muscleMap.set(muscle, (muscleMap.get(muscle) || 0) + 1);
      });

      const muscleDistribution = Array.from(muscleMap.entries())
        .map(([muscle, count]) => ({
          muscle: muscle.replace("_", " "),
          count,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);

      // Calculate streaks
      const sortedDates = [...new Set(workouts?.map((w) => w.workout_date) || [])].sort();
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;

      // Check current streak (working backwards from today)
      const today = new Date().toISOString().split("T")[0];
      for (let i = 0; i < 365; i++) {
        const checkDate = subDays(new Date(), i).toISOString().split("T")[0];
        if (sortedDates.includes(checkDate)) {
          if (i === 0 || currentStreak > 0) {
            currentStreak++;
          }
        } else if (i > 0 && currentStreak > 0) {
          break;
        }
      }

      // Calculate longest streak
      sortedDates.forEach((date, i) => {
        if (i === 0) {
          tempStreak = 1;
        } else {
          const prevDate = parseISO(sortedDates[i - 1]);
          const currDate = parseISO(date);
          const diff = differenceInDays(currDate, prevDate);
          if (diff === 1) {
            tempStreak++;
          } else {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 1;
          }
        }
      });
      longestStreak = Math.max(longestStreak, tempStreak);

      // Most active day of week
      const dayCount = new Map<string, number>();
      workouts?.forEach((w) => {
        const dayName = format(parseISO(w.workout_date), "EEEE");
        dayCount.set(dayName, (dayCount.get(dayName) || 0) + 1);
      });
      const mostActiveDay = Array.from(dayCount.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

      // Calculate averages
      const totalWorkouts = workouts?.length || 0;
      const avgWorkoutDuration =
        totalWorkouts > 0
          ? Math.round(workouts!.reduce((acc, w) => acc + (w.duration_minutes || 0), 0) / totalWorkouts)
          : 0;

      const exercisesByWorkout = new Map<string, number>();
      exerciseLogs.forEach((ex) => {
        exercisesByWorkout.set(
          ex.workout_log_id,
          (exercisesByWorkout.get(ex.workout_log_id) || 0) + 1
        );
      });
      const avgExercisesPerWorkout =
        exercisesByWorkout.size > 0
          ? Math.round(
              Array.from(exercisesByWorkout.values()).reduce((a, b) => a + b, 0) /
                exercisesByWorkout.size
            )
          : 0;

      return {
        weeklyVolume,
        weeklyFrequency,
        muscleDistribution,
        progressMetrics: {
          totalWorkouts,
          avgWorkoutDuration,
          avgExercisesPerWorkout,
          currentStreak,
          longestStreak,
          mostActiveDay,
        },
      };
    },
    enabled: !!user?.id,
  });
}
