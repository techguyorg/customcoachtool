import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface CheckinTemplate {
  id: string;
  coach_id: string;
  client_id: string | null;
  name: string;
  description: string | null;
  frequency_days: number;
  required_fields: Record<string, boolean> & {
    weight?: boolean;
    measurements?: boolean;
    photos?: boolean;
    diet_adherence?: boolean;
    workout_adherence?: boolean;
    sleep_quality?: boolean;
    energy_level?: boolean;
    stress_level?: boolean;
    notes?: boolean;
  };
  is_active: boolean;
  created_at: string;
}

export interface ClientCheckin {
  id: string;
  client_id: string;
  coach_id: string | null;
  template_id: string | null;
  checkin_date: string;
  period_start: string | null;
  period_end: string | null;
  measurement_id: string | null;
  diet_adherence: number | null;
  workout_adherence: number | null;
  sleep_quality: number | null;
  energy_level: number | null;
  stress_level: number | null;
  mood_rating: number | null;
  diet_notes: string | null;
  workout_notes: string | null;
  general_notes: string | null;
  wins: string | null;
  challenges: string | null;
  photo_ids: string[];
  status: 'draft' | 'submitted' | 'reviewed' | 'acknowledged';
  submitted_at: string | null;
  coach_feedback: string | null;
  coach_rating: number | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  created_at: string;
}

export type CheckinInput = Partial<Omit<ClientCheckin, 'id' | 'client_id' | 'created_at'>>;

// Client hooks

export function useMyCheckins() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["my-checkins", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("client_checkins")
        .select("*")
        .eq("client_id", user.id)
        .order("checkin_date", { ascending: false });

      if (error) throw error;
      return data as ClientCheckin[];
    },
    enabled: !!user?.id,
  });
}

export function useSubmitCheckin() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (checkin: CheckinInput) => {
      if (!user?.id) throw new Error("Not authenticated");

      // Get coach if assigned
      const { data: relationship } = await supabase
        .from("coach_client_relationships")
        .select("coach_id")
        .eq("client_id", user.id)
        .eq("status", "active")
        .single();

      const { data, error } = await supabase
        .from("client_checkins")
        .insert({
          ...checkin,
          client_id: user.id,
          coach_id: relationship?.coach_id || null,
          status: "submitted",
          submitted_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Create notification for coach
      if (relationship?.coach_id) {
        await supabase.from("notifications").insert({
          user_id: relationship.coach_id,
          type: "checkin_submitted",
          title: "New Check-in Submitted",
          message: `Your client has submitted a new check-in`,
          reference_type: "checkin",
          reference_id: data.id,
        });

        // Send email notification to coach if opted in
        try {
          await supabase.functions.invoke("send-checkin-notification", {
            body: { 
              type: "submitted", 
              checkinId: data.id,
              coachId: relationship.coach_id,
            },
          });
        } catch (e) {
          console.log("Email notification failed (non-critical):", e);
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-checkins", user?.id] });
    },
  });
}

export function useSaveCheckinDraft() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, ...checkin }: CheckinInput & { id?: string }) => {
      if (!user?.id) throw new Error("Not authenticated");

      if (id) {
        const { data, error } = await supabase
          .from("client_checkins")
          .update({ ...checkin, status: "draft" })
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("client_checkins")
          .insert({
            ...checkin,
            client_id: user.id,
            status: "draft",
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-checkins", user?.id] });
    },
  });
}

// Coach hooks

export function useCoachCheckins() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["coach-checkins", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("client_checkins")
        .select("*")
        .eq("coach_id", user.id)
        .order("submitted_at", { ascending: false });

      if (error) throw error;
      return data as ClientCheckin[];
    },
    enabled: !!user?.id,
  });
}

export function usePendingCheckins() {
  const { user } = useAuth();
  const { data: checkins } = useCoachCheckins();

  return checkins?.filter(c => c.status === "submitted") || [];
}

export function useReviewCheckin() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      checkinId, 
      feedback, 
      rating,
      nextCheckinDate
    }: { 
      checkinId: string; 
      feedback: string; 
      rating?: number;
      nextCheckinDate?: string;
    }) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("client_checkins")
        .update({
          coach_feedback: feedback,
          coach_rating: rating,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
          status: "reviewed",
          next_checkin_date: nextCheckinDate || null,
        })
        .eq("id", checkinId)
        .select()
        .single();

      if (error) throw error;

      // Notify client
      await supabase.from("notifications").insert({
        user_id: data.client_id,
        type: "checkin_reviewed",
        title: "Check-in Reviewed",
        message: "Your coach has reviewed your check-in",
        reference_type: "checkin",
        reference_id: checkinId,
      });

      // Send email notification if opted in
      try {
        await supabase.functions.invoke("send-checkin-notification", {
          body: { 
            type: "reviewed", 
            checkinId,
            clientId: data.client_id,
          },
        });
      } catch (e) {
        console.log("Email notification failed (non-critical):", e);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach-checkins", user?.id] });
    },
  });
}

// Check-in templates

export function useCheckinTemplates() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["checkin-templates", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("checkin_templates")
        .select("*")
        .eq("coach_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as CheckinTemplate[];
    },
    enabled: !!user?.id,
  });
}

export function useCreateCheckinTemplate() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (template: Partial<CheckinTemplate>) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("checkin_templates")
        .insert({
          ...template,
          coach_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checkin-templates", user?.id] });
    },
  });
}

export function useClientCheckinTemplate() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["my-checkin-template", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Get coach relationship
      const { data: relationship } = await supabase
        .from("coach_client_relationships")
        .select("coach_id")
        .eq("client_id", user.id)
        .eq("status", "active")
        .single();

      if (!relationship?.coach_id) return null;

      // Check for client-specific template first
      const { data: specificTemplate } = await supabase
        .from("checkin_templates")
        .select("*")
        .eq("coach_id", relationship.coach_id)
        .eq("client_id", user.id)
        .eq("is_active", true)
        .single();

      if (specificTemplate) return specificTemplate as CheckinTemplate;

      // Fall back to default template
      const { data: defaultTemplate } = await supabase
        .from("checkin_templates")
        .select("*")
        .eq("coach_id", relationship.coach_id)
        .is("client_id", null)
        .eq("is_active", true)
        .single();

      return defaultTemplate as CheckinTemplate | null;
    },
    enabled: !!user?.id,
  });
}
