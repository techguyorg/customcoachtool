import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

export type MealType = "breakfast" | "lunch" | "dinner" | "snack" | "other";

export interface NutritionLogEntry {
  id: string;
  client_id: string;
  log_date: string;
  meal_type: MealType;
  food_id: string | null;
  recipe_id: string | null;
  custom_food_name: string | null;
  quantity: number;
  unit: string;
  calories: number | null;
  protein_grams: number | null;
  carbs_grams: number | null;
  fat_grams: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  food?: {
    id: string;
    name: string;
    category: string;
  };
  recipe?: {
    id: string;
    name: string;
    category: string;
  };
}

export function useNutritionLog(date?: Date) {
  const { user } = useAuth();
  const dateStr = date ? format(date, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd");

  return useQuery({
    queryKey: ["nutrition-log", user?.id, dateStr],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_nutrition_logs")
        .select(`
          *,
          food:foods(id, name, category),
          recipe:recipes(id, name, category)
        `)
        .eq("client_id", user!.id)
        .eq("log_date", dateStr)
        .order("created_at");

      if (error) throw error;
      return data as NutritionLogEntry[];
    },
    enabled: !!user?.id,
  });
}

export function useNutritionLogRange(startDate: Date, endDate: Date) {
  const { user } = useAuth();
  const startStr = format(startDate, "yyyy-MM-dd");
  const endStr = format(endDate, "yyyy-MM-dd");

  return useQuery({
    queryKey: ["nutrition-log-range", user?.id, startStr, endStr],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_nutrition_logs")
        .select(`
          *,
          food:foods(id, name, category),
          recipe:recipes(id, name, category)
        `)
        .eq("client_id", user!.id)
        .gte("log_date", startStr)
        .lte("log_date", endStr)
        .order("log_date")
        .order("created_at");

      if (error) throw error;
      return data as NutritionLogEntry[];
    },
    enabled: !!user?.id,
  });
}

export function useAddNutritionLog() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (
      entry: Omit<NutritionLogEntry, "id" | "client_id" | "created_at" | "updated_at" | "food" | "recipe">
    ) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("client_nutrition_logs")
        .insert({
          ...entry,
          client_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nutrition-log"] });
      queryClient.invalidateQueries({ queryKey: ["nutrition-log-range"] });
    },
  });
}

export function useUpdateNutritionLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      entry,
    }: {
      id: string;
      entry: Partial<NutritionLogEntry>;
    }) => {
      const { data, error } = await supabase
        .from("client_nutrition_logs")
        .update(entry)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nutrition-log"] });
      queryClient.invalidateQueries({ queryKey: ["nutrition-log-range"] });
    },
  });
}

export function useDeleteNutritionLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("client_nutrition_logs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nutrition-log"] });
      queryClient.invalidateQueries({ queryKey: ["nutrition-log-range"] });
    },
  });
}

// Calculate daily nutrition totals
export function calculateDailyTotals(entries: NutritionLogEntry[]) {
  return entries.reduce(
    (acc, entry) => ({
      calories: acc.calories + (entry.calories || 0),
      protein: acc.protein + (entry.protein_grams || 0),
      carbs: acc.carbs + (entry.carbs_grams || 0),
      fat: acc.fat + (entry.fat_grams || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

// Group entries by meal type
export function groupByMealType(entries: NutritionLogEntry[]) {
  const groups: Record<MealType, NutritionLogEntry[]> = {
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: [],
    other: [],
  };

  entries.forEach((entry) => {
    groups[entry.meal_type].push(entry);
  });

  return groups;
}
