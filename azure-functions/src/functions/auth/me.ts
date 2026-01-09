import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { validateBearerToken } from "../../lib/auth";
import { queryOne, query } from "../../lib/db";
import { corsOptionsResponse, errorResponse, successResponse } from "../../lib/cors";

export async function getMe(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  if (request.method === "OPTIONS") {
    return corsOptionsResponse();
  }

  try {
    const authHeader = request.headers.get("Authorization");
    const payload = await validateBearerToken(authHeader);

    if (!payload) {
      return errorResponse(401, "Unauthorized");
    }

    // Get user
    const user = await queryOne<{ id: string; email: string; email_verified: boolean }>(
      `SELECT id, email, email_verified FROM users WHERE id = @userId`,
      { userId: payload.userId }
    );

    if (!user) {
      return errorResponse(404, "User not found");
    }

    // Get profile
    const profile = await queryOne<{
      full_name: string;
      avatar_url: string | null;
      phone: string | null;
      bio: string | null;
      onboarding_completed: boolean;
    }>(
      `SELECT full_name, avatar_url, phone, bio, onboarding_completed FROM profiles WHERE user_id = @userId`,
      { userId: user.id }
    );

    // Get roles
    const roles = await query<{ role: string }>(
      `SELECT role FROM user_roles WHERE user_id = @userId`,
      { userId: user.id }
    );

    const primaryRole = roles.length > 0 ? roles[0].role : "client";

    return successResponse({
      id: user.id,
      email: user.email,
      fullName: profile?.full_name || "",
      avatarUrl: profile?.avatar_url,
      phone: profile?.phone,
      bio: profile?.bio,
      role: primaryRole,
      roles: roles.map((r) => r.role),
      emailVerified: user.email_verified,
      onboardingCompleted: profile?.onboarding_completed || false,
    });
  } catch (error) {
    context.error("Get me error:", error);
    return errorResponse(500, "Internal server error");
  }
}

app.http("auth-me", {
  methods: ["GET", "OPTIONS"],
  route: "auth/me",
  authLevel: "anonymous",
  handler: getMe,
});
