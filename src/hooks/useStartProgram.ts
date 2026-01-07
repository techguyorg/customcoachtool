import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function useStartProgram() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      templateId,
      startDate = new Date().toISOString().split("T")[0],
    }: {
      templateId: string;
      startDate?: string;
    }) => {
      if (!user?.id) throw new Error("Not authenticated");

      // Check if already assigned/active
      const { data: existing } = await supabase
        .from("plan_assignments")
        .select("id")
        .eq("client_id", user.id)
        .eq("workout_template_id", templateId)
        .eq("status", "active")
        .maybeSingle();

      if (existing) {
        throw new Error("You already have this program active");
      }

      // Create self-assignment (coach_id = client_id for self-assigned)
      const { data, error } = await supabase
        .from("plan_assignments")
        .insert({
          coach_id: user.id,
          client_id: user.id,
          plan_type: "workout",
          workout_template_id: templateId,
          start_date: startDate,
          status: "active",
          coach_notes: "Self-assigned program",
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plan-assignments"] });
      queryClient.invalidateQueries({ queryKey: ["active-programs"] });
      toast.success("Program started! Track your progress in My Programs.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to start program");
    },
  });
}

export function useStartDietPlan() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      dietPlanId,
      startDate = new Date().toISOString().split("T")[0],
    }: {
      dietPlanId: string;
      startDate?: string;
    }) => {
      if (!user?.id) throw new Error("Not authenticated");

      // Check if already assigned/active
      const { data: existing } = await supabase
        .from("plan_assignments")
        .select("id")
        .eq("client_id", user.id)
        .eq("diet_plan_id", dietPlanId)
        .eq("status", "active")
        .maybeSingle();

      if (existing) {
        throw new Error("You already have this diet plan active");
      }

      // Create self-assignment
      const { data, error } = await supabase
        .from("plan_assignments")
        .insert({
          coach_id: user.id,
          client_id: user.id,
          plan_type: "diet",
          diet_plan_id: dietPlanId,
          start_date: startDate,
          status: "active",
          coach_notes: "Self-assigned diet plan",
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plan-assignments"] });
      queryClient.invalidateQueries({ queryKey: ["active-diet-plans"] });
      toast.success("Diet plan started! Track your nutrition in My Plans.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to start diet plan");
    },
  });
}