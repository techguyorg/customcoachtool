import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { hashPassword, revokeAllUserTokens } from "../../lib/auth";
import { queryOne, execute } from "../../lib/db";
import { corsOptionsResponse, errorResponse, successResponse } from "../../lib/cors";

interface ResetPasswordRequest {
  token: string;
  password: string;
}

export async function resetPassword(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  if (request.method === "OPTIONS") {
    return corsOptionsResponse();
  }

  try {
    const body = (await request.json()) as ResetPasswordRequest;
    const { token, password } = body;

    if (!token || !password) {
      return errorResponse(400, "Token and password are required");
    }

    if (password.length < 8) {
      return errorResponse(400, "Password must be at least 8 characters");
    }

    // Find user with valid reset token
    const user = await queryOne<{ id: string }>(
      `SELECT id FROM users 
       WHERE password_reset_token = @token 
         AND password_reset_expires > SYSDATETIMEOFFSET()`,
      { token }
    );

    if (!user) {
      return errorResponse(400, "Invalid or expired reset token");
    }

    // Hash new password
    const passwordHash = await hashPassword(password);

    // Update password and clear reset token
    await execute(
      `UPDATE users 
       SET password_hash = @passwordHash, 
           password_reset_token = NULL, 
           password_reset_expires = NULL 
       WHERE id = @userId`,
      { passwordHash, userId: user.id }
    );

    // Revoke all existing sessions for security
    await revokeAllUserTokens(user.id);

    return successResponse({ message: "Password reset successfully" });
  } catch (error) {
    context.error("Reset password error:", error);
    return errorResponse(500, "Internal server error");
  }
}

app.http("auth-reset-password", {
  methods: ["POST", "OPTIONS"],
  route: "auth/reset-password",
  authLevel: "anonymous",
  handler: resetPassword,
});
