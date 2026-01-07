import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface PlanAssignment {
  id: string;
  coach_id: string;
  client_id: string;
  plan_type: 'workout' | 'diet';
  workout_template_id: string | null;
  diet_plan_id: string | null;
  start_date: string;
  end_date: string | null;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  coach_notes: string | null;
  client_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlanAssignmentWithDetails extends PlanAssignment {
  workout_template?: {
    id: string;
    name: string;
    description: string | null;
    difficulty: string;
    days_per_week: number;
    duration_weeks: number | null;
  } | null;
}

export function useClientAssignments(clientId?: string) {
  const { user } = useAuth();
  const targetId = clientId || user?.id;

  return useQuery({
    queryKey: ["plan-assignments", targetId],
    queryFn: async () => {
      if (!targetId) return [];

      const { data, error } = await supabase
        .from("plan_assignments")
        .select(`
          *,
          workout_template:workout_templates(
            id, name, description, difficulty, days_per_week, duration_weeks
          )
        `)
        .eq("client_id", targetId)
        .order("start_date", { ascending: false });

      if (error) throw error;
      return data as PlanAssignmentWithDetails[];
    },
    enabled: !!targetId,
  });
}

export function useCoachAssignments() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["coach-assignments", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("plan_assignments")
        .select(`
          *,
          workout_template:workout_templates(
            id, name, description, difficulty, days_per_week, duration_weeks
          )
        `)
        .eq("coach_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as PlanAssignmentWithDetails[];
    },
    enabled: !!user?.id,
  });
}

export function useAssignPlan() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      clientId,
      planType,
      workoutTemplateId,
      dietPlanId,
      startDate,
      endDate,
      notes,
    }: {
      clientId: string;
      planType: 'workout' | 'diet';
      workoutTemplateId?: string;
      dietPlanId?: string;
      startDate: string;
      endDate?: string;
      notes?: string;
    }) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("plan_assignments")
        .insert({
          coach_id: user.id,
          client_id: clientId,
          plan_type: planType,
          workout_template_id: workoutTemplateId || null,
          diet_plan_id: dietPlanId || null,
          start_date: startDate,
          end_date: endDate || null,
          coach_notes: notes || null,
          status: "active",
        })
        .select()
        .single();

      if (error) throw error;

      // Notify client
      await supabase.from("notifications").insert({
        user_id: clientId,
        type: "plan_assigned",
        title: "New Plan Assigned",
        message: `Your coach has assigned a new ${planType} plan for you`,
        reference_type: "plan_assignment",
        reference_id: data.id,
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach-assignments", user?.id] });
    },
  });
}

export function useUpdateAssignment() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      id, 
      ...updates 
    }: Partial<PlanAssignment> & { id: string }) => {
      const { data, error } = await supabase
        .from("plan_assignments")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach-assignments", user?.id] });
    },
  });
}

export function useActiveAssignments(clientId?: string) {
  const { data: assignments } = useClientAssignments(clientId);
  return assignments?.filter(a => a.status === "active") || [];
}
