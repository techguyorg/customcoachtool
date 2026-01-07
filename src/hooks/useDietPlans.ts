import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface DietPlanMeal {
  id: string;
  plan_id: string;
  meal_number: number;
  meal_name: string;
  time_suggestion: string | null;
  calories: number | null;
  protein_grams: number | null;
  carbs_grams: number | null;
  fat_grams: number | null;
  food_suggestions: string[] | null;
  notes: string | null;
  created_at: string;
}

export interface DietPlan {
  id: string;
  created_by: string | null;
  name: string;
  description: string | null;
  goal: string | null;
  calories_target: number | null;
  protein_grams: number | null;
  carbs_grams: number | null;
  fat_grams: number | null;
  meals_per_day: number;
  dietary_type: string | null;
  is_system: boolean;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  meals?: DietPlanMeal[];
}

export function useDietPlans() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["diet-plans", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("diet_plans")
        .select("*")
        .or(`is_system.eq.true,created_by.eq.${user?.id}`)
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data as DietPlan[];
    },
    enabled: !!user?.id,
  });
}

export function useDietPlanWithMeals(planId?: string) {
  return useQuery({
    queryKey: ["diet-plan", planId],
    queryFn: async () => {
      if (!planId) return null;

      const { data: plan, error: planError } = await supabase
        .from("diet_plans")
        .select("*")
        .eq("id", planId)
        .single();

      if (planError) throw planError;

      const { data: meals, error: mealsError } = await supabase
        .from("diet_plan_meals")
        .select("*")
        .eq("plan_id", planId)
        .order("meal_number");

      if (mealsError) throw mealsError;

      return { ...plan, meals } as DietPlan;
    },
    enabled: !!planId,
  });
}

export function useCreateDietPlan() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      plan,
      meals,
    }: {
      plan: Omit<DietPlan, "id" | "created_at" | "updated_at" | "created_by" | "meals">;
      meals?: Omit<DietPlanMeal, "id" | "plan_id" | "created_at">[];
    }) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { data: createdPlan, error: planError } = await supabase
        .from("diet_plans")
        .insert({
          ...plan,
          created_by: user.id,
        })
        .select()
        .single();

      if (planError) throw planError;

      if (meals && meals.length > 0) {
        const { error: mealsError } = await supabase
          .from("diet_plan_meals")
          .insert(
            meals.map((meal) => ({
              ...meal,
              plan_id: createdPlan.id,
            }))
          );

        if (mealsError) throw mealsError;
      }

      return createdPlan;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diet-plans"] });
    },
  });
}

export function useUpdateDietPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      plan,
      meals,
    }: {
      id: string;
      plan: Partial<DietPlan>;
      meals?: Omit<DietPlanMeal, "id" | "plan_id" | "created_at">[];
    }) => {
      const { data, error } = await supabase
        .from("diet_plans")
        .update(plan)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      if (meals) {
        // Delete existing meals and insert new ones
        await supabase.from("diet_plan_meals").delete().eq("plan_id", id);

        if (meals.length > 0) {
          const { error: mealsError } = await supabase
            .from("diet_plan_meals")
            .insert(
              meals.map((meal) => ({
                ...meal,
                plan_id: id,
              }))
            );

          if (mealsError) throw mealsError;
        }
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["diet-plans"] });
      queryClient.invalidateQueries({ queryKey: ["diet-plan", variables.id] });
    },
  });
}

export function useDeleteDietPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("diet_plans").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diet-plans"] });
    },
  });
}
