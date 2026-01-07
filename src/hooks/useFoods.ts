import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Food {
  id: string;
  name: string;
  category: string | null;
  subcategory: string | null;
  brand: string | null;
  barcode: string | null;
  calories_per_100g: number | null;
  protein_per_100g: number | null;
  carbs_per_100g: number | null;
  fat_per_100g: number | null;
  fiber_per_100g: number | null;
  sugar_per_100g: number | null;
  sodium_mg_per_100g: number | null;
  default_serving_size: number | null;
  default_serving_unit: string | null;
  is_system: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// Calculate calories from macros: P×4 + C×4 + F×9
export function calculateCalories(protein: number, carbs: number, fat: number): number {
  return Math.round(protein * 4 + carbs * 4 + fat * 9);
}

// Calculate nutrition for a given quantity
export function calculateNutrition(
  food: Food,
  quantity: number,
  unit: string = "g"
): { calories: number; protein: number; carbs: number; fat: number; fiber: number } {
  // Convert to grams if needed (simple conversions)
  let grams = quantity;
  if (unit === "oz") grams = quantity * 28.35;
  if (unit === "lb") grams = quantity * 453.6;
  if (unit === "serving" && food.default_serving_size) {
    grams = food.default_serving_size;
  }

  const multiplier = grams / 100;
  const protein = Math.round((food.protein_per_100g || 0) * multiplier * 10) / 10;
  const carbs = Math.round((food.carbs_per_100g || 0) * multiplier * 10) / 10;
  const fat = Math.round((food.fat_per_100g || 0) * multiplier * 10) / 10;
  const fiber = Math.round((food.fiber_per_100g || 0) * multiplier * 10) / 10;
  const calories = calculateCalories(protein, carbs, fat);

  return { calories, protein, carbs, fat, fiber };
}

export function useFoods(searchQuery?: string, category?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["foods", searchQuery, category, user?.id],
    queryFn: async () => {
      let query = supabase
        .from("foods")
        .select("*")
        .or(`is_system.eq.true${user?.id ? `,created_by.eq.${user.id}` : ""}`)
        .order("name");

      if (searchQuery && searchQuery.length >= 2) {
        query = query.ilike("name", `%${searchQuery}%`);
      }

      if (category) {
        query = query.eq("category", category);
      }

      query = query.limit(50);

      const { data, error } = await query;
      if (error) throw error;
      return data as Food[];
    },
    enabled: !searchQuery || searchQuery.length >= 2,
  });
}

export function useFoodCategories() {
  return useQuery({
    queryKey: ["food-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("foods")
        .select("category")
        .eq("is_system", true)
        .not("category", "is", null);

      if (error) throw error;
      const categories = [...new Set(data.map((d) => d.category as string))];
      return categories.sort();
    },
  });
}

export function useCreateFood() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (food: Omit<Food, "id" | "created_at" | "updated_at" | "created_by" | "is_system">) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("foods")
        .insert({
          ...food,
          created_by: user.id,
          is_system: false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["foods"] });
    },
  });
}
