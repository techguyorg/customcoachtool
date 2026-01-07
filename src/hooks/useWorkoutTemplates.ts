import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type WorkoutTemplate = Database["public"]["Tables"]["workout_templates"]["Row"];
type TemplateType = Database["public"]["Enums"]["template_type"];
type DifficultyLevel = Database["public"]["Enums"]["difficulty_level"];

export interface TemplateWithStats extends WorkoutTemplate {
  week_count: number;
  day_count: number;
  exercise_count: number;
}

export interface TemplateFilters {
  search: string;
  templateType: TemplateType | "all";
  difficulty: DifficultyLevel | "all";
  daysPerWeek: number | "all";
}

export function useWorkoutTemplates(filters: TemplateFilters) {
  return useQuery({
    queryKey: ["workout-templates", filters],
    queryFn: async () => {
      let query = supabase
        .from("workout_templates")
        .select(`
          *,
          workout_template_weeks(count),
          workout_template_days(count)
        `)
        .eq("is_system", true)
        .order("name");

      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,goal.ilike.%${filters.search}%`);
      }

      if (filters.templateType !== "all") {
        query = query.eq("template_type", filters.templateType);
      }

      if (filters.difficulty !== "all") {
        query = query.eq("difficulty", filters.difficulty);
      }

      if (filters.daysPerWeek !== "all") {
        query = query.eq("days_per_week", filters.daysPerWeek);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Transform data to include counts
      return (data || []).map((template: any) => ({
        ...template,
        week_count: template.workout_template_weeks?.[0]?.count || 0,
        day_count: template.workout_template_days?.[0]?.count || 0,
        exercise_count: 0, // Will be fetched in detail view
      })) as TemplateWithStats[];
    },
  });
}

export interface TemplateWeek {
  id: string;
  week_number: number;
  name: string | null;
  focus: string | null;
  notes: string | null;
  days: TemplateDay[];
}

export interface TemplateDay {
  id: string;
  day_number: number;
  name: string;
  notes: string | null;
  exercises: TemplateExercise[];
}

export interface TemplateExercise {
  id: string;
  order_index: number;
  sets_min: number;
  sets_max: number | null;
  reps_min: number;
  reps_max: number | null;
  rest_seconds_min: number | null;
  rest_seconds_max: number | null;
  notes: string | null;
  custom_exercise_name: string | null;
  exercise: {
    id: string;
    name: string;
    primary_muscle: string;
    equipment: string;
    difficulty: string;
  } | null;
}

export function useWorkoutTemplateDetail(id: string | null) {
  return useQuery({
    queryKey: ["workout-template-detail", id],
    queryFn: async () => {
      if (!id) return null;

      // Fetch template
      const { data: template, error: templateError } = await supabase
        .from("workout_templates")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (templateError) throw templateError;
      if (!template) return null;

      // Fetch weeks
      const { data: weeks, error: weeksError } = await supabase
        .from("workout_template_weeks")
        .select("*")
        .eq("template_id", id)
        .order("week_number");

      if (weeksError) throw weeksError;

      // Fetch all days for this template
      const { data: days, error: daysError } = await supabase
        .from("workout_template_days")
        .select("*")
        .eq("template_id", id)
        .order("day_number");

      if (daysError) throw daysError;

      // Fetch all exercises for all days
      const dayIds = days?.map(d => d.id) || [];
      let exercises: any[] = [];
      
      if (dayIds.length > 0) {
        const { data: exerciseData, error: exercisesError } = await supabase
          .from("workout_template_exercises")
          .select(`
            *,
            exercise:exercises(id, name, primary_muscle, equipment, difficulty)
          `)
          .in("day_id", dayIds)
          .order("order_index");

        if (exercisesError) throw exercisesError;
        exercises = exerciseData || [];
      }

      // Group exercises by day
      const exercisesByDay = exercises.reduce((acc, ex) => {
        if (!acc[ex.day_id]) acc[ex.day_id] = [];
        acc[ex.day_id].push(ex);
        return acc;
      }, {} as Record<string, typeof exercises>);

      // Build structured weeks with days and exercises
      const structuredWeeks: TemplateWeek[] = (weeks || []).map(week => {
        const weekDays = (days || [])
          .filter(d => d.week_id === week.id)
          .map(day => ({
            ...day,
            exercises: exercisesByDay[day.id] || [],
          }));

        return {
          ...week,
          days: weekDays,
        };
      });

      // Handle days without weeks (simple templates)
      const daysWithoutWeeks = (days || []).filter(d => !d.week_id);
      if (daysWithoutWeeks.length > 0 && structuredWeeks.length === 0) {
        structuredWeeks.push({
          id: "default",
          week_number: 1,
          name: "Program Schedule",
          focus: null,
          notes: null,
          days: daysWithoutWeeks.map(day => ({
            ...day,
            exercises: exercisesByDay[day.id] || [],
          })),
        });
      }

      return {
        ...template,
        weeks: structuredWeeks,
        total_exercises: exercises.length,
      };
    },
    enabled: !!id,
  });
}

export const TEMPLATE_TYPES: TemplateType[] = [
  "push_pull_legs",
  "upper_lower",
  "full_body",
  "bro_split",
  "strength",
  "hypertrophy",
  "powerbuilding",
  "sport_specific",
  "cardio_conditioning",
  "functional",
  "bodyweight",
  "beginner",
];

export const DAYS_PER_WEEK_OPTIONS = [2, 3, 4, 5, 6, 7];
