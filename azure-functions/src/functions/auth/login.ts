import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { verifyPassword, createAuthTokens } from "../../lib/auth";
import { queryOne, execute, query } from "../../lib/db";
import { corsOptionsResponse, errorResponse, successResponse } from "../../lib/cors";

interface LoginRequest {
  email: string;
  password: string;
}

interface UserRecord {
  id: string;
  email: string;
  password_hash: string;
  email_verified: boolean;
  is_active: boolean;
}

export async function login(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  if (request.method === "OPTIONS") {
    return corsOptionsResponse();
  }

  try {
    const body = (await request.json()) as LoginRequest;
    const { email, password } = body;

    if (!email || !password) {
      return errorResponse(400, "Email and password are required");
    }

    const emailLower = email.toLowerCase().trim();

    // Get user
    const user = await queryOne<UserRecord>(
      `SELECT id, email, password_hash, email_verified, is_active FROM users WHERE email = @email`,
      { email: emailLower }
    );

    if (!user) {
      return errorResponse(401, "Invalid email or password");
    }

    if (!user.is_active) {
      return errorResponse(403, "Account is disabled");
    }

    if (!user.password_hash) {
      return errorResponse(401, "Please sign in with Google");
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return errorResponse(401, "Invalid email or password");
    }

    // Get profile
    const profile = await queryOne<{ full_name: string; avatar_url: string | null }>(
      `SELECT full_name, avatar_url FROM profiles WHERE user_id = @userId`,
      { userId: user.id }
    );

    // Get roles
    const roles = await query<{ role: string }>(
      `SELECT role FROM user_roles WHERE user_id = @userId`,
      { userId: user.id }
    );

    const primaryRole = roles.length > 0 ? roles[0].role : "client";

    // Generate tokens
    const tokens = await createAuthTokens(user.id, user.email);

    // Update last login
    await execute(
      `UPDATE users SET last_login_at = SYSDATETIMEOFFSET(), login_count = login_count + 1 WHERE id = @userId`,
      { userId: user.id }
    );

    return successResponse({
      user: {
        id: user.id,
        email: user.email,
        fullName: profile?.full_name || "",
        avatarUrl: profile?.avatar_url,
        role: primaryRole,
        roles: roles.map((r) => r.role),
        emailVerified: user.email_verified,
      },
      ...tokens,
    });
  } catch (error) {
    context.error("Login error:", error);
    return errorResponse(500, "Internal server error");
  }
}

app.http("auth-login", {
  methods: ["POST", "OPTIONS"],
  route: "auth/login",
  authLevel: "anonymous",
  handler: login,
});
