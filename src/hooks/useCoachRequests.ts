import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface CoachingRequestWithClient {
  id: string;
  client_id: string;
  coach_id: string;
  status: string;
  message: string | null;
  coach_response: string | null;
  created_at: string;
  responded_at: string | null;
  client_profile?: {
    full_name: string;
    email: string;
    avatar_url: string | null;
  };
}

export function useCoachRequests() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["coach-requests", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data: requests, error } = await supabase
        .from("coaching_requests")
        .select("*")
        .eq("coach_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch client profiles
      const clientIds = requests.map((r) => r.client_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, email, avatar_url")
        .in("user_id", clientIds);

      const profileMap: Record<string, any> = {};
      profiles?.forEach((p) => {
        profileMap[p.user_id] = p;
      });

      return requests.map((r) => ({
        ...r,
        client_profile: profileMap[r.client_id] || null,
      })) as CoachingRequestWithClient[];
    },
    enabled: !!user,
  });
}

export function usePendingRequestsCount() {
  const { data: requests } = useCoachRequests();
  return requests?.filter((r) => r.status === "pending").length || 0;
}

export function useRespondToRequest() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      requestId,
      status,
      response,
    }: {
      requestId: string;
      status: "accepted" | "declined";
      response?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");

      const { data: request, error: fetchError } = await supabase
        .from("coaching_requests")
        .select("client_id")
        .eq("id", requestId)
        .single();

      if (fetchError) throw fetchError;

      // Update the request
      const { error } = await supabase
        .from("coaching_requests")
        .update({
          status,
          coach_response: response,
          responded_at: new Date().toISOString(),
        })
        .eq("id", requestId);

      if (error) throw error;

      // If accepted, create the coach-client relationship
      if (status === "accepted") {
        const { error: relError } = await supabase
          .from("coach_client_relationships")
          .insert({
            coach_id: user.id,
            client_id: request.client_id,
            status: "active",
            started_at: new Date().toISOString(),
          });

        if (relError && !relError.message.includes("duplicate")) {
          throw relError;
        }

        // Update client profile with coach_id
        await supabase
          .from("client_profiles")
          .update({ coach_id: user.id })
          .eq("user_id", request.client_id);
      }

      // Send notification to client
      await supabase.from("notifications").insert({
        user_id: request.client_id,
        type: "coaching_response",
        title: status === "accepted" ? "Request Accepted! 🎉" : "Request Declined",
        message:
          status === "accepted"
            ? `Great news! ${user.fullName} has accepted your coaching request. You can now start working together!`
            : `${user.fullName} has declined your coaching request.${response ? ` Message: ${response}` : ""}`,
        reference_type: "coaching_request",
        reference_id: requestId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach-requests"] });
      queryClient.invalidateQueries({ queryKey: ["coach-clients"] });
    },
  });
}
