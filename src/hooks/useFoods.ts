import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, Food } from "@/lib/api";

// Re-export Food type
export type { Food };

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
  return useQuery({
    queryKey: ["foods", searchQuery, category],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery && searchQuery.length >= 2) params.append('search', searchQuery);
      if (category) params.append('category', category);
      
      const queryString = params.toString();
      const endpoint = `/api/foods${queryString ? `?${queryString}` : ''}`;
      return api.get<Food[]>(endpoint);
    },
    enabled: !searchQuery || searchQuery.length >= 2,
  });
}

export function useFoodCategories() {
  return useQuery({
    queryKey: ["food-categories"],
    queryFn: async () => {
      const data = await api.get<{ category: string; count: number }[]>('/api/foods/categories');
      return data.map(d => d.category).sort();
    },
  });
}

export function useCreateFood() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (food: Omit<Food, "id" | "created_at" | "updated_at" | "created_by" | "is_system">) => {
      return api.post<Food>('/api/foods', food);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["foods"] });
    },
  });
}

export function useUpdateFood() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, food }: { id: string; food: Partial<Food> }) => {
      return api.put<Food>(`/api/foods/${id}`, food);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["foods"] });
    },
  });
}

export function useDeleteFood() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/api/foods/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["foods"] });
    },
  });
}
