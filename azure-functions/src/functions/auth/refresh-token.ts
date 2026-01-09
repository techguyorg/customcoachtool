import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { validateRefreshToken, createAuthTokens, revokeRefreshToken } from "../../lib/auth";
import { queryOne } from "../../lib/db";
import { corsOptionsResponse, errorResponse, successResponse } from "../../lib/cors";

interface RefreshRequest {
  refreshToken: string;
}

export async function refreshToken(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  if (request.method === "OPTIONS") {
    return corsOptionsResponse();
  }

  try {
    const body = (await request.json()) as RefreshRequest;
    const { refreshToken: token } = body;

    if (!token) {
      return errorResponse(400, "Refresh token is required");
    }

    // Validate refresh token
    const userId = await validateRefreshToken(token);
    if (!userId) {
      return errorResponse(401, "Invalid or expired refresh token");
    }

    // Get user email
    const user = await queryOne<{ email: string; is_active: boolean }>(
      `SELECT email, is_active FROM users WHERE id = @userId`,
      { userId }
    );

    if (!user || !user.is_active) {
      return errorResponse(401, "User not found or disabled");
    }

    // Revoke old refresh token
    await revokeRefreshToken(token);

    // Generate new tokens
    const tokens = await createAuthTokens(userId, user.email);

    return successResponse(tokens);
  } catch (error) {
    context.error("Refresh token error:", error);
    return errorResponse(500, "Internal server error");
  }
}

app.http("auth-refresh", {
  methods: ["POST", "OPTIONS"],
  route: "auth/refresh",
  authLevel: "anonymous",
  handler: refreshToken,
});
