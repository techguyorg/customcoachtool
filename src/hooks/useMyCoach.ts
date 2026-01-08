import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface MyCoachInfo {
  coachId: string;
  fullName: string;
  avatarUrl: string | null;
  bio: string | null;
  email: string;
  specializations: string[] | null;
  rating: number | null;
  experienceYears: number | null;
}

export function useMyCoach() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["my-coach", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Get active coach-client relationship
      const { data: relationship, error: relError } = await supabase
        .from("coach_client_relationships")
        .select("coach_id")
        .eq("client_id", user.id)
        .eq("status", "active")
        .maybeSingle();

      if (relError) throw relError;
      if (!relationship) return null;

      // Get coach profile info
      const [profileRes, coachProfileRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("full_name, avatar_url, bio, email")
          .eq("user_id", relationship.coach_id)
          .single(),
        supabase
          .from("coach_profiles")
          .select("specializations, rating, experience_years")
          .eq("user_id", relationship.coach_id)
          .single(),
      ]);

      if (!profileRes.data) return null;

      return {
        coachId: relationship.coach_id,
        fullName: profileRes.data.full_name,
        avatarUrl: profileRes.data.avatar_url,
        bio: profileRes.data.bio,
        email: profileRes.data.email,
        specializations: coachProfileRes.data?.specializations || null,
        rating: coachProfileRes.data?.rating || null,
        experienceYears: coachProfileRes.data?.experience_years || null,
      } as MyCoachInfo;
    },
    enabled: !!user?.id,
  });
}

export function useEndCoachingRelationship() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Not authenticated");

      // Update relationship to ended
      const { error } = await supabase
        .from("coach_client_relationships")
        .update({
          status: "ended",
          ended_at: new Date().toISOString(),
        })
        .eq("client_id", user.id)
        .eq("status", "active");

      if (error) throw error;

      // Also update client_profiles to remove coach_id
      await supabase
        .from("client_profiles")
        .update({ coach_id: null })
        .eq("user_id", user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-coach"] });
      queryClient.invalidateQueries({ queryKey: ["client-profile"] });
    },
  });
}
