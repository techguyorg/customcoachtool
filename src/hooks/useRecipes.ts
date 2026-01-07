import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { calculateCalories } from "./useFoods";

export interface RecipeIngredient {
  id: string;
  recipe_id: string;
  food_id: string;
  quantity: number;
  unit: string;
  notes: string | null;
  order_index: number;
  created_at: string;
  food?: {
    id: string;
    name: string;
    calories_per_100g: number | null;
    protein_per_100g: number | null;
    carbs_per_100g: number | null;
    fat_per_100g: number | null;
    fiber_per_100g: number | null;
  };
}

export interface Recipe {
  id: string;
  created_by: string | null;
  name: string;
  description: string | null;
  category: string | null;
  instructions: string | null;
  prep_time_minutes: number | null;
  cook_time_minutes: number | null;
  servings: number;
  calories_per_serving: number | null;
  protein_per_serving: number | null;
  carbs_per_serving: number | null;
  fat_per_serving: number | null;
  fiber_per_serving: number | null;
  total_weight_g: number | null;
  is_system: boolean;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  ingredients?: RecipeIngredient[];
}

// Calculate recipe totals from ingredients
export function calculateRecipeTotals(
  ingredients: Array<{
    quantity: number;
    unit: string;
    food: {
      protein_per_100g: number | null;
      carbs_per_100g: number | null;
      fat_per_100g: number | null;
      default_serving_size?: number | null;
    };
  }>
): { calories: number; protein: number; carbs: number; fat: number } {
  let protein = 0;
  let carbs = 0;
  let fat = 0;

  for (const ing of ingredients) {
    let grams = ing.quantity;
    if (ing.unit === "oz") grams = ing.quantity * 28.35;
    if (ing.unit === "lb") grams = ing.quantity * 453.6;
    if (ing.unit === "serving" && ing.food.default_serving_size) {
      grams = ing.food.default_serving_size;
    }

    const multiplier = grams / 100;
    protein += (ing.food.protein_per_100g || 0) * multiplier;
    carbs += (ing.food.carbs_per_100g || 0) * multiplier;
    fat += (ing.food.fat_per_100g || 0) * multiplier;
  }

  return {
    calories: calculateCalories(protein, carbs, fat),
    protein: Math.round(protein * 10) / 10,
    carbs: Math.round(carbs * 10) / 10,
    fat: Math.round(fat * 10) / 10,
  };
}

export function useRecipes(searchQuery?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["recipes", searchQuery, user?.id],
    queryFn: async () => {
      let query = supabase
        .from("recipes")
        .select("*")
        .or(`is_system.eq.true${user?.id ? `,created_by.eq.${user.id}` : ""}`)
        .order("name");

      if (searchQuery && searchQuery.length >= 2) {
        query = query.ilike("name", `%${searchQuery}%`);
      }

      query = query.limit(50);

      const { data, error } = await query;
      if (error) throw error;
      return data as Recipe[];
    },
    enabled: !searchQuery || searchQuery.length >= 2,
  });
}

export function useRecipeWithIngredients(recipeId?: string) {
  return useQuery({
    queryKey: ["recipe", recipeId],
    queryFn: async () => {
      if (!recipeId) return null;

      const { data: recipe, error: recipeError } = await supabase
        .from("recipes")
        .select("*")
        .eq("id", recipeId)
        .single();

      if (recipeError) throw recipeError;

      const { data: ingredients, error: ingError } = await supabase
        .from("recipe_ingredients")
        .select(`
          *,
          food:foods(id, name, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g)
        `)
        .eq("recipe_id", recipeId)
        .order("order_index");

      if (ingError) throw ingError;

      return { ...recipe, ingredients } as Recipe;
    },
    enabled: !!recipeId,
  });
}

export function useCreateRecipe() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      recipe,
      ingredients,
    }: {
      recipe: {
        name: string;
        description?: string | null;
        category?: string | null;
        instructions?: string | null;
        prep_time_minutes?: number | null;
        cook_time_minutes?: number | null;
        servings: number;
        calories_per_serving?: number | null;
        protein_per_serving?: number | null;
        carbs_per_serving?: number | null;
        fat_per_serving?: number | null;
        image_url?: string | null;
      };
      ingredients: Array<{ food_id: string; quantity: number; unit: string; notes?: string }>;
    }) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { data: createdRecipe, error: recipeError } = await supabase
        .from("recipes")
        .insert({
          ...recipe,
          created_by: user.id,
          is_system: false,
        })
        .select()
        .single();

      if (recipeError) throw recipeError;

      if (ingredients.length > 0) {
        const { error: ingError } = await supabase
          .from("recipe_ingredients")
          .insert(
            ingredients.map((ing, idx) => ({
              recipe_id: createdRecipe.id,
              food_id: ing.food_id,
              quantity: ing.quantity,
              unit: ing.unit,
              notes: ing.notes || null,
              order_index: idx,
            }))
          );

        if (ingError) throw ingError;
      }

      return createdRecipe;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
    },
  });
}

export function useUpdateRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      recipe,
      ingredients,
    }: {
      id: string;
      recipe: Partial<Recipe>;
      ingredients?: Array<{ food_id: string; quantity: number; unit: string; notes?: string }>;
    }) => {
      const { data, error } = await supabase
        .from("recipes")
        .update(recipe)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      if (ingredients) {
        await supabase.from("recipe_ingredients").delete().eq("recipe_id", id);

        if (ingredients.length > 0) {
          const { error: ingError } = await supabase
            .from("recipe_ingredients")
            .insert(
              ingredients.map((ing, idx) => ({
                recipe_id: id,
                food_id: ing.food_id,
                quantity: ing.quantity,
                unit: ing.unit,
                notes: ing.notes || null,
                order_index: idx,
              }))
            );

          if (ingError) throw ingError;
        }
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      queryClient.invalidateQueries({ queryKey: ["recipe", variables.id] });
    },
  });
}

export function useDeleteRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("recipes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
    },
  });
}
