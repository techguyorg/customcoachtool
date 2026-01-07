import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Exercise = Database["public"]["Tables"]["exercises"]["Row"];
type MuscleGroup = Database["public"]["Enums"]["muscle_group"];
type EquipmentType = Database["public"]["Enums"]["equipment_type"];
type DifficultyLevel = Database["public"]["Enums"]["difficulty_level"];

export interface ExerciseFilters {
  search: string;
  muscleGroup: MuscleGroup | "all";
  equipment: EquipmentType | "all";
  difficulty: DifficultyLevel | "all";
}

export function useExercises(filters: ExerciseFilters) {
  return useQuery({
    queryKey: ["exercises", filters],
    queryFn: async () => {
      let query = supabase
        .from("exercises")
        .select("*")
        .order("name");

      if (filters.search) {
        query = query.ilike("name", `%${filters.search}%`);
      }

      if (filters.muscleGroup !== "all") {
        query = query.eq("primary_muscle", filters.muscleGroup);
      }

      if (filters.equipment !== "all") {
        query = query.eq("equipment", filters.equipment);
      }

      if (filters.difficulty !== "all") {
        query = query.eq("difficulty", filters.difficulty);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Exercise[];
    },
  });
}

export function useExercise(id: string | null) {
  return useQuery({
    queryKey: ["exercise", id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from("exercises")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data as Exercise | null;
    },
    enabled: !!id,
  });
}

export const MUSCLE_GROUPS: MuscleGroup[] = [
  "chest", "back", "shoulders", "biceps", "triceps", "forearms",
  "quadriceps", "hamstrings", "glutes", "calves", "abs", "obliques",
  "lower_back", "traps", "lats"
];

export const EQUIPMENT_TYPES: EquipmentType[] = [
  "barbell", "dumbbell", "cable", "machine", "bodyweight", "kettlebell",
  "resistance_band", "ez_bar", "smith_machine", "pull_up_bar", "dip_station",
  "bench", "cardio_machine", "other"
];

export const DIFFICULTY_LEVELS: DifficultyLevel[] = [
  "beginner", "intermediate", "advanced"
];
