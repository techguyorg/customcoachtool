import React, { createContext, useContext, useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import {
  AuthUser,
  AppRole,
  SignUpData,
  SignInData,
  signUp as authSignUp,
  signIn as authSignIn,
  signOut as authSignOut,
  getSession,
  getAuthUser,
  onAuthStateChange,
} from "@/lib/auth";

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  isLoading: boolean;
  signUp: (data: SignUpData) => Promise<{ error: Error | null }>;
  signIn: (data: SignInData) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  hasRole: (role: AppRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = onAuthStateChange(async (event, newSession) => {
      setSession(newSession);
      
      if (newSession?.user) {
        // Defer profile fetch to avoid blocking
        setTimeout(async () => {
          const authUser = await getAuthUser();
          setUser(authUser);
        }, 0);
      } else {
        setUser(null);
      }
      
      setIsLoading(false);
    });

    // Then get initial session
    getSession().then(async (initialSession) => {
      setSession(initialSession);
      
      if (initialSession?.user) {
        const authUser = await getAuthUser();
        setUser(authUser);
      }
      
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (data: SignUpData) => {
    const result = await authSignUp(data);
    return { error: result.error };
  };

  const signIn = async (data: SignInData) => {
    const result = await authSignIn(data);
    return { error: result.error };
  };

  const signOut = async () => {
    await authSignOut();
    setUser(null);
    setSession(null);
  };

  const hasRole = (role: AppRole) => {
    return user?.role === role;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        signUp,
        signIn,
        signOut,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
