import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
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
      return api.get<CoachingRequestWithClient[]>('/api/coach/requests');
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
      return api.post(`/api/coach/requests/${requestId}/respond`, { status, response });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach-requests"] });
      queryClient.invalidateQueries({ queryKey: ["coach-clients"] });
    },
  });
}
