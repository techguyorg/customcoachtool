import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface CoachClient {
  id: string;
  client_id: string;
  status: string;
  started_at: string | null;
  ended_at: string | null;
  notes: string | null;
  created_at: string;
  profile: {
    full_name: string;
    email: string;
    avatar_url: string | null;
  } | null;
  client_profile: {
    current_weight_kg: number | null;
    target_weight_kg: number | null;
    fitness_level: string | null;
    fitness_goals: string[] | null;
    subscription_status: string | null;
  } | null;
}

export function useCoachClients() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["coach-clients", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("coach_client_relationships")
        .select(`
          id,
          client_id,
          status,
          started_at,
          ended_at,
          notes,
          created_at
        `)
        .eq("coach_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch profiles and client_profiles for each client
      const clientIds = data?.map(r => r.client_id) || [];
      
      if (clientIds.length === 0) return [];

      const [profilesResult, clientProfilesResult] = await Promise.all([
        supabase
          .from("profiles")
          .select("user_id, full_name, email, avatar_url")
          .in("user_id", clientIds),
        supabase
          .from("client_profiles")
          .select("user_id, current_weight_kg, target_weight_kg, fitness_level, fitness_goals, subscription_status")
          .in("user_id", clientIds),
      ]);

      const profilesMap = new Map(
        (profilesResult.data || []).map(p => [p.user_id, p])
      );
      const clientProfilesMap = new Map(
        (clientProfilesResult.data || []).map(cp => [cp.user_id, cp])
      );

      return (data || []).map(relationship => ({
        ...relationship,
        profile: profilesMap.get(relationship.client_id) || null,
        client_profile: clientProfilesMap.get(relationship.client_id) || null,
      })) as CoachClient[];
    },
    enabled: !!user?.id,
  });
}

export function useUpdateClientStatus() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ relationshipId, status }: { relationshipId: string; status: string }) => {
      const updateData: any = { status };
      
      if (status === "active") {
        updateData.started_at = new Date().toISOString();
        updateData.ended_at = null;
      } else if (status === "ended" || status === "paused") {
        updateData.ended_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("coach_client_relationships")
        .update(updateData)
        .eq("id", relationshipId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach-clients", user?.id] });
    },
  });
}

export interface ClientInvitation {
  email: string;
  name: string;
  message?: string;
}

export function useInviteClient() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (invitation: ClientInvitation) => {
      const response = await supabase.functions.invoke("send-client-invitation", {
        body: {
          ...invitation,
          coachId: user?.id,
          coachName: user?.fullName,
        },
      });

      if (response.error) throw response.error;
      return response.data;
    },
  });
}

export function useClientStats() {
  const { data: clients } = useCoachClients();

  const stats = {
    total: clients?.length || 0,
    active: clients?.filter(c => c.status === "active").length || 0,
    pending: clients?.filter(c => c.status === "pending").length || 0,
    paused: clients?.filter(c => c.status === "paused").length || 0,
  };

  return stats;
}
