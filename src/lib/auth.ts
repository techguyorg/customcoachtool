/**
 * Authentication Service Layer
 * Abstraction for auth operations - can be swapped for Azure AD B2C later
 */

import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export type AppRole = "super_admin" | "coach" | "client";

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: AppRole;
  avatarUrl?: string;
}

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  role: AppRole;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthResult {
  user: User | null;
  session: Session | null;
  error: Error | null;
}

/**
 * Sign up a new user with role
 */
export async function signUp(data: SignUpData): Promise<AuthResult> {
  const { data: result, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      emailRedirectTo: window.location.origin,
      data: {
        full_name: data.fullName,
        role: data.role,
      },
    },
  });

  return {
    user: result.user,
    session: result.session,
    error: error ? new Error(error.message) : null,
  };
}

/**
 * Sign in an existing user
 */
export async function signIn(data: SignInData): Promise<AuthResult> {
  const { data: result, error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });

  return {
    user: result.user,
    session: result.session,
    error: error ? new Error(error.message) : null,
  };
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<{ error: Error | null }> {
  const { error } = await supabase.auth.signOut();
  return { error: error ? new Error(error.message) : null };
}

/**
 * Request password reset email
 */
export async function resetPassword(email: string): Promise<{ error: Error | null }> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/login?reset=true`,
  });
  return { error: error ? new Error(error.message) : null };
}

/**
 * Update password (after reset or for logged in user)
 */
export async function updatePassword(newPassword: string): Promise<{ error: Error | null }> {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  return { error: error ? new Error(error.message) : null };
}

/**
 * Get the current session
 */
export async function getSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

/**
 * Get the current user
 */
export async function getCurrentUser(): Promise<User | null> {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

/**
 * Subscribe to auth state changes
 */
export function onAuthStateChange(
  callback: (event: string, session: Session | null) => void
) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
}

/**
 * Get user roles from database
 */
export async function getUserRoles(userId: string): Promise<AppRole[]> {
  const { data, error } = await supabase.rpc("get_user_roles", {
    _user_id: userId,
  });

  if (error) {
    console.error("Error fetching user roles:", error);
    return [];
  }

  return (data as AppRole[]) || [];
}

/**
 * Check if user has a specific role
 */
export async function hasRole(userId: string, role: AppRole): Promise<boolean> {
  const { data, error } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: role,
  });

  if (error) {
    console.error("Error checking role:", error);
    return false;
  }

  return data || false;
}

/**
 * Get user profile from database
 */
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }

  return data;
}

/**
 * Get full auth user with profile and roles
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const [profile, roles] = await Promise.all([
    getUserProfile(user.id),
    getUserRoles(user.id),
  ]);

  if (!profile) return null;

  return {
    id: user.id,
    email: profile.email,
    fullName: profile.full_name,
    role: roles[0] || "client",
    avatarUrl: profile.avatar_url,
  };
}