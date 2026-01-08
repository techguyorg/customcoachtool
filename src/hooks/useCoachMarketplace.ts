import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface CoachProfile {
  id: string;
  user_id: string;
  specializations: string[] | null;
  certifications: string[] | null;
  experience_years: number | null;
  hourly_rate: number | null;
  currency: string | null;
  rating: number | null;
  total_reviews: number | null;
  is_accepting_clients: boolean | null;
  max_clients: number | null;
  profile: {
    full_name: string;
    email: string;
    avatar_url: string | null;
    bio: string | null;
  } | null;
  client_count?: number;
}

export interface CoachFilters {
  search: string;
  specialization: string;
  minRating: number;
  maxRate: number | null;
  acceptingOnly: boolean;
}

export function useCoachMarketplace(filters: CoachFilters, excludeCurrentCoach = true) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["coach-marketplace", filters, user?.id, excludeCurrentCoach],
    queryFn: async () => {
      // First get current coach if we need to exclude them
      let currentCoachId: string | null = null;
      if (excludeCurrentCoach && user?.id) {
        const { data: relationship } = await supabase
          .from("coach_client_relationships")
          .select("coach_id")
          .eq("client_id", user.id)
          .eq("status", "active")
          .maybeSingle();
        currentCoachId = relationship?.coach_id || null;
      }

      // Get all coach profiles
      let query = supabase
        .from("coach_profiles")
        .select("*")
        .order("rating", { ascending: false, nullsFirst: false });

      if (filters.acceptingOnly) {
        query = query.eq("is_accepting_clients", true);
      }

      if (filters.minRating > 0) {
        query = query.gte("rating", filters.minRating);
      }

      if (filters.maxRate) {
        query = query.lte("hourly_rate", filters.maxRate);
      }

      const { data: coachProfiles, error } = await query;

      if (error) throw error;
      if (!coachProfiles || coachProfiles.length === 0) return [];

      // Filter out current coach
      const filteredCoachProfiles = currentCoachId
        ? coachProfiles.filter(cp => cp.user_id !== currentCoachId)
        : coachProfiles;

      if (filteredCoachProfiles.length === 0) return [];

      // Get profiles for these coaches
      const userIds = filteredCoachProfiles.map(cp => cp.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, email, avatar_url, bio")
        .in("user_id", userIds);

      const profileMap = new Map(
        (profiles || []).map(p => [p.user_id, p])
      );

      // Combine the data
      const data = filteredCoachProfiles.map(cp => ({
        ...cp,
        profile: profileMap.get(cp.user_id) || null,
      }));

      // Filter by search and specialization in memory
      let coaches = (data || []) as unknown as CoachProfile[];

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        coaches = coaches.filter(
          (coach) =>
            coach.profile?.full_name?.toLowerCase().includes(searchLower) ||
            coach.specializations?.some((s) =>
              s.toLowerCase().includes(searchLower)
            )
        );
      }

      if (filters.specialization && filters.specialization !== "all") {
        coaches = coaches.filter((coach) =>
          coach.specializations?.includes(filters.specialization)
        );
      }

      // Get client counts for each coach
      const coachIds = coaches.map((c) => c.user_id);
      if (coachIds.length > 0) {
        const { data: relationships } = await supabase
          .from("coach_client_relationships")
          .select("coach_id")
          .in("coach_id", coachIds)
          .eq("status", "active");

        const countMap: Record<string, number> = {};
        relationships?.forEach((r) => {
          countMap[r.coach_id] = (countMap[r.coach_id] || 0) + 1;
        });

        coaches = coaches.map((coach) => ({
          ...coach,
          client_count: countMap[coach.user_id] || 0,
        }));
      }

      return coaches;
    },
  });
}

export function useCoachingRequests() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["coaching-requests", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("coaching_requests")
        .select("*")
        .eq("client_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useSendCoachingRequest() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      coachId,
      message,
    }: {
      coachId: string;
      message?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");

      // Get client's name from profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", user.id)
        .single();

      const clientName = profile?.full_name || "A client";

      const { error } = await supabase.from("coaching_requests").insert({
        client_id: user.id,
        coach_id: coachId,
        message,
      });

      if (error) throw error;

      // Send notification to coach
      await supabase.from("notifications").insert({
        user_id: coachId,
        type: "coaching_request",
        title: "New Coaching Request",
        message: `${clientName} has requested to work with you as their coach.`,
        reference_type: "coaching_request",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coaching-requests"] });
    },
  });
}

export function useCancelCoachingRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) => {
      const { error } = await supabase
        .from("coaching_requests")
        .update({ status: "cancelled" })
        .eq("id", requestId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coaching-requests"] });
    },
  });
}

// Get all unique specializations for filter dropdown
export function useSpecializations() {
  return useQuery({
    queryKey: ["coach-specializations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coach_profiles")
        .select("specializations")
        .not("specializations", "is", null);

      if (error) throw error;

      const allSpecs = new Set<string>();
      data?.forEach((coach) => {
        coach.specializations?.forEach((spec: string) => allSpecs.add(spec));
      });

      return Array.from(allSpecs).sort();
    },
  });
}