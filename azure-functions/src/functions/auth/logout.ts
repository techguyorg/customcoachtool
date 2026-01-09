import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { revokeRefreshToken, revokeAllUserTokens, validateBearerToken } from "../../lib/auth";
import { corsOptionsResponse, errorResponse, successResponse } from "../../lib/cors";

interface LogoutRequest {
  refreshToken?: string;
  allDevices?: boolean;
}

export async function logout(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  if (request.method === "OPTIONS") {
    return corsOptionsResponse();
  }

  try {
    const body = (await request.json()) as LogoutRequest;
    const { refreshToken, allDevices = false } = body;

    // Get user from access token if provided
    const authHeader = request.headers.get("Authorization");
    const payload = await validateBearerToken(authHeader);

    if (allDevices && payload) {
      // Revoke all refresh tokens for this user
      await revokeAllUserTokens(payload.userId);
    } else if (refreshToken) {
      // Revoke specific refresh token
      await revokeRefreshToken(refreshToken);
    }

    return successResponse({ message: "Logged out successfully" });
  } catch (error) {
    context.error("Logout error:", error);
    // Still return success even if there's an error - user should be logged out client-side
    return successResponse({ message: "Logged out" });
  }
}

app.http("auth-logout", {
  methods: ["POST", "OPTIONS"],
  route: "auth/logout",
  authLevel: "anonymous",
  handler: logout,
});
