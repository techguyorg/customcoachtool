import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

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
  diet_plan?: {
    id: string;
    name: string;
    description: string | null;
    calories_target: number | null;
    protein_grams: number | null;
    carbs_grams: number | null;
    fat_grams: number | null;
  } | null;
}

export function useClientAssignments(clientId?: string) {
  const { user } = useAuth();
  const targetId = clientId || user?.id;

  return useQuery({
    queryKey: ["plan-assignments", targetId],
    queryFn: async () => {
      if (!targetId) return [];
      const data = await api.get<PlanAssignmentWithDetails[]>(`/api/client/${targetId}/assignments`);
      return data;
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
      const data = await api.get<PlanAssignmentWithDetails[]>('/api/coach/assignments');
      return data;
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
      planName,
      coachName,
    }: {
      clientId: string;
      planType: 'workout' | 'diet';
      workoutTemplateId?: string;
      dietPlanId?: string;
      startDate: string;
      endDate?: string;
      notes?: string;
      planName?: string;
      coachName?: string;
    }) => {
      if (!user?.id) throw new Error("Not authenticated");

      const data = await api.post<PlanAssignment>('/api/coach/assignments', {
        clientId,
        planType,
        workoutTemplateId,
        dietPlanId,
        startDate,
        endDate,
        notes,
        planName,
        coachName,
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach-assignments", user?.id] });
      toast.success("Plan assigned successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to assign plan");
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
      const data = await api.put<PlanAssignment>(`/api/coach/assignments/${id}`, updates);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach-assignments", user?.id] });
      toast.success("Assignment updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update assignment");
    },
  });
}

export function useActiveAssignments(clientId?: string) {
  const { data: assignments } = useClientAssignments(clientId);
  return assignments?.filter(a => a.status === "active") || [];
}
