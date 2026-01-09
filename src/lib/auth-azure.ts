/**
 * Azure-based authentication service
 * Self-managed JWT authentication with Google OAuth support
 */

const API_URL = import.meta.env.VITE_API_URL || "";

export type AppRole = "super_admin" | "coach" | "client";

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string | null;
  phone?: string | null;
  bio?: string | null;
  role: AppRole;
  roles: string[];
  emailVerified: boolean;
  onboardingCompleted?: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse extends AuthTokens {
  user: AuthUser;
}

// Storage keys
const ACCESS_TOKEN_KEY = "ccp_access_token";
const REFRESH_TOKEN_KEY = "ccp_refresh_token";
const USER_KEY = "ccp_user";

// Token management
export function getStoredTokens() {
  return {
    accessToken: localStorage.getItem(ACCESS_TOKEN_KEY),
    refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY),
  };
}

export function getStoredUser(): AuthUser | null {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
}

function storeAuth(response: AuthResponse) {
  localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(response.user));
}

export function clearAuth() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function updateStoredUser(updates: Partial<AuthUser>) {
  const user = getStoredUser();
  if (user) {
    const updated = { ...user, ...updates };
    localStorage.setItem(USER_KEY, JSON.stringify(updated));
    return updated;
  }
  return null;
}

// API Calls
export async function signUp(
  email: string,
  password: string,
  fullName: string,
  role: "coach" | "client" = "client"
): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, fullName, role }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Signup failed");
  }

  const data: AuthResponse = await response.json();
  storeAuth(data);
  return data;
}

export async function signIn(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Login failed");
  }

  const data: AuthResponse = await response.json();
  storeAuth(data);
  return data;
}

export async function signInWithGoogle(code: string, role?: string): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/auth/google/callback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, role }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Google login failed");
  }

  const data: AuthResponse = await response.json();
  storeAuth(data);
  return data;
}

export function getGoogleAuthUrl(role: "coach" | "client" = "client"): string {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const redirectUri = `${window.location.origin}/auth/google/callback`;
  const state = btoa(JSON.stringify({ role }));

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "consent",
    state,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export async function signOut(): Promise<void> {
  const { refreshToken, accessToken } = getStoredTokens();

  if (refreshToken) {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ refreshToken }),
      });
    } catch (e) {
      // Ignore logout API errors
      console.warn("Logout API error:", e);
    }
  }

  clearAuth();
}

export async function refreshAccessToken(): Promise<string | null> {
  const { refreshToken } = getStoredTokens();
  if (!refreshToken) return null;

  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      clearAuth();
      return null;
    }

    const data = await response.json();
    localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
    if (data.refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
    }
    return data.accessToken;
  } catch {
    clearAuth();
    return null;
  }
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const { accessToken } = getStoredTokens();
  if (!accessToken) return null;

  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Try refresh
        const newToken = await refreshAccessToken();
        if (newToken) {
          return getAuthUser();
        }
        clearAuth();
      }
      return null;
    }

    const user = await response.json();
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  } catch {
    return getStoredUser();
  }
}

export async function forgotPassword(email: string): Promise<void> {
  const response = await fetch(`${API_URL}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to send reset email");
  }
}

export async function resetPassword(token: string, password: string): Promise<void> {
  const response = await fetch(`${API_URL}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to reset password");
  }
}

export async function verifyEmail(token: string): Promise<void> {
  const response = await fetch(`${API_URL}/auth/verify-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to verify email");
  }

  // Update stored user
  updateStoredUser({ emailVerified: true });
}

export async function resendVerificationEmail(): Promise<void> {
  const { accessToken } = getStoredTokens();

  const response = await fetch(`${API_URL}/auth/resend-verification`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to resend verification email");
  }
}

// Check if token is expired or about to expire
export function isTokenExpired(token: string, bufferSeconds: number = 60): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const expiresAt = payload.exp * 1000;
    return Date.now() > expiresAt - bufferSeconds * 1000;
  } catch {
    return true;
  }
}

// Get valid access token (refresh if needed)
export async function getValidAccessToken(): Promise<string | null> {
  const { accessToken } = getStoredTokens();
  if (!accessToken) return null;

  if (isTokenExpired(accessToken)) {
    return refreshAccessToken();
  }

  return accessToken;
}
