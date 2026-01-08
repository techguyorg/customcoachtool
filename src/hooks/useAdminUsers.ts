import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppRole } from "@/lib/auth";
import { toast } from "sonner";

export interface AdminUser {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  phone: string | null;
  created_at: string;
  roles: AppRole[];
}

export function useAdminUsers() {
  const queryClient = useQueryClient();

  const usersQuery = useQuery({
    queryKey: ["admin-users"],
    queryFn: async (): Promise<AdminUser[]> => {
      // Get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Get all roles
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      // Map roles to users
      const roleMap = new Map<string, AppRole[]>();
      roles?.forEach((r) => {
        const existing = roleMap.get(r.user_id) || [];
        roleMap.set(r.user_id, [...existing, r.role as AppRole]);
      });

      return (profiles || []).map((p) => ({
        id: p.id,
        user_id: p.user_id,
        email: p.email,
        full_name: p.full_name,
        avatar_url: p.avatar_url,
        phone: p.phone,
        created_at: p.created_at,
        roles: roleMap.get(p.user_id) || [],
      }));
    },
  });

  const addRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role });

      if (error) throw error;

      // Create role-specific profile if needed
      if (role === "coach") {
        await supabase.from("coach_profiles").upsert({ user_id: userId }, { onConflict: "user_id" });
      } else if (role === "client") {
        await supabase.from("client_profiles").upsert({ user_id: userId }, { onConflict: "user_id" });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Role added successfully");
    },
    onError: (error: any) => {
      if (error.code === "23505") {
        toast.error("User already has this role");
      } else {
        toast.error("Failed to add role");
      }
    },
  });

  const removeRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", role);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Role removed successfully");
    },
    onError: () => {
      toast.error("Failed to remove role");
    },
  });

  return {
    users: usersQuery.data || [],
    isLoading: usersQuery.isLoading,
    error: usersQuery.error,
    addRole: addRoleMutation.mutate,
    removeRole: removeRoleMutation.mutate,
    isAddingRole: addRoleMutation.isPending,
    isRemovingRole: removeRoleMutation.isPending,
  };
}
