import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type FavoriteItemType = "diet_plan" | "recipe" | "workout_template" | "exercise";

export interface UserFavorite {
  id: string;
  user_id: string;
  item_type: FavoriteItemType;
  item_id: string;
  created_at: string;
}

export function useFavorites(itemType?: FavoriteItemType) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["favorites", user?.id, itemType],
    queryFn: async () => {
      let query = supabase
        .from("user_favorites")
        .select("*")
        .eq("user_id", user!.id);

      if (itemType) {
        query = query.eq("item_type", itemType);
      }

      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      return data as UserFavorite[];
    },
    enabled: !!user?.id,
  });
}

export function useIsFavorite(itemType: FavoriteItemType, itemId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["favorite-check", user?.id, itemType, itemId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_favorites")
        .select("id")
        .eq("user_id", user!.id)
        .eq("item_type", itemType)
        .eq("item_id", itemId)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: !!user?.id && !!itemId,
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      itemType,
      itemId,
      isFavorite,
    }: {
      itemType: FavoriteItemType;
      itemId: string;
      isFavorite: boolean;
    }) => {
      if (!user?.id) throw new Error("Not authenticated");

      if (isFavorite) {
        // Remove favorite
        const { error } = await supabase
          .from("user_favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("item_type", itemType)
          .eq("item_id", itemId);

        if (error) throw error;
      } else {
        // Add favorite
        const { error } = await supabase.from("user_favorites").insert({
          user_id: user.id,
          item_type: itemType,
          item_id: itemId,
        });

        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      queryClient.invalidateQueries({
        queryKey: ["favorite-check", user?.id, variables.itemType, variables.itemId],
      });
    },
  });
}

export function useFavoriteItems<T>(
  itemType: FavoriteItemType,
  fetchItems: (ids: string[]) => Promise<T[]>
) {
  const { data: favorites = [] } = useFavorites(itemType);
  const itemIds = favorites.map((f) => f.item_id);

  return useQuery({
    queryKey: ["favorite-items", itemType, itemIds],
    queryFn: () => fetchItems(itemIds),
    enabled: itemIds.length > 0,
  });
}
