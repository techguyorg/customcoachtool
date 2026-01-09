import React, { createContext, useContext, useEffect, useState } from "react";
import {
  AuthUser,
  AppRole,
  signUp as authSignUp,
  signIn as authSignIn,
  signInWithGoogle as authSignInWithGoogle,
  signOut as authSignOut,
  getStoredUser,
  getStoredTokens,
  getAuthUser,
  clearAuth,
} from "@/lib/auth-azure";

interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  role: AppRole;
}

interface SignInData {
  email: string;
  password: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  signUp: (data: SignUpData) => Promise<{ error: Error | null }>;
  signIn: (data: SignInData) => Promise<{ error: Error | null }>;
  signInWithGoogle: (code: string, role?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  hasRole: (role: AppRole) => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth on mount
    const initAuth = async () => {
      const { accessToken } = getStoredTokens();
      
      if (accessToken) {
        // Try to get fresh user data
        const authUser = await getAuthUser();
        setUser(authUser);
      } else {
        // No token, check for stored user (offline fallback)
        const storedUser = getStoredUser();
        if (storedUser) {
          // Validate by trying to get fresh data
          const authUser = await getAuthUser();
          setUser(authUser);
        }
      }
      
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const signUp = async (data: SignUpData) => {
    try {
      const response = await authSignUp(data.email, data.password, data.fullName, data.role as "coach" | "client");
      setUser(response.user);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signIn = async (data: SignInData) => {
    try {
      const response = await authSignIn(data.email, data.password);
      setUser(response.user);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signInWithGoogle = async (code: string, role?: string) => {
    try {
      const response = await authSignInWithGoogle(code, role);
      setUser(response.user);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await authSignOut();
    setUser(null);
  };

  const hasRole = (role: AppRole) => {
    return user?.role === role || user?.roles?.includes(role) || false;
  };

  const refreshUser = async () => {
    const authUser = await getAuthUser();
    setUser(authUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        hasRole,
        refreshUser,
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
