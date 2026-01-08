import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PlatformStats {
  totalUsers: number;
  totalCoaches: number;
  totalClients: number;
  totalAdmins: number;
  activeCoachings: number;
  pendingRequests: number;
  systemExercises: number;
  systemWorkoutTemplates: number;
  systemDietPlans: number;
  systemRecipes: number;
  systemFoods: number;
}

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: async (): Promise<PlatformStats> => {
      // Fetch all stats in parallel
      const [
        usersRes,
        rolesRes,
        relationshipsRes,
        requestsRes,
        exercisesRes,
        templatesRes,
        dietPlansRes,
        recipesRes,
        foodsRes,
      ] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("user_roles").select("role"),
        supabase.from("coach_client_relationships").select("id", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("coaching_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("exercises").select("id", { count: "exact", head: true }).eq("is_system", true),
        supabase.from("workout_templates").select("id", { count: "exact", head: true }).eq("is_system", true),
        supabase.from("diet_plans").select("id", { count: "exact", head: true }).eq("is_system", true),
        supabase.from("recipes").select("id", { count: "exact", head: true }).eq("is_system", true),
        supabase.from("foods").select("id", { count: "exact", head: true }).eq("is_system", true),
      ]);

      // Count roles
      const roles = rolesRes.data || [];
      const coachCount = roles.filter(r => r.role === "coach").length;
      const clientCount = roles.filter(r => r.role === "client").length;
      const adminCount = roles.filter(r => r.role === "super_admin").length;

      return {
        totalUsers: usersRes.count || 0,
        totalCoaches: coachCount,
        totalClients: clientCount,
        totalAdmins: adminCount,
        activeCoachings: relationshipsRes.count || 0,
        pendingRequests: requestsRes.count || 0,
        systemExercises: exercisesRes.count || 0,
        systemWorkoutTemplates: templatesRes.count || 0,
        systemDietPlans: dietPlansRes.count || 0,
        systemRecipes: recipesRes.count || 0,
        systemFoods: foodsRes.count || 0,
      };
    },
  });
}
