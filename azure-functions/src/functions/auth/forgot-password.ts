import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { generateResetToken } from "../../lib/auth";
import { queryOne, execute } from "../../lib/db";
import { sendPasswordResetEmail } from "../../lib/email";
import { corsOptionsResponse, errorResponse, successResponse } from "../../lib/cors";

interface ForgotPasswordRequest {
  email: string;
}

export async function forgotPassword(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  if (request.method === "OPTIONS") {
    return corsOptionsResponse();
  }

  try {
    const body = (await request.json()) as ForgotPasswordRequest;
    const { email } = body;

    if (!email) {
      return errorResponse(400, "Email is required");
    }

    const emailLower = email.toLowerCase().trim();

    // Get user - but don't reveal if they exist
    const user = await queryOne<{ id: string; password_hash: string | null }>(
      `SELECT id, password_hash FROM users WHERE email = @email`,
      { email: emailLower }
    );

    // Always return success to prevent email enumeration
    if (!user || !user.password_hash) {
      // User doesn't exist or is OAuth-only, but don't reveal that
      return successResponse({ message: "If an account exists, a reset email has been sent" });
    }

    // Get profile for name
    const profile = await queryOne<{ full_name: string }>(
      `SELECT full_name FROM profiles WHERE user_id = @userId`,
      { userId: user.id }
    );

    // Generate reset token
    const resetToken = generateResetToken();
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1); // 1 hour expiry

    // Save token
    await execute(
      `UPDATE users SET password_reset_token = @resetToken, password_reset_expires = @resetExpires WHERE id = @userId`,
      { resetToken, resetExpires, userId: user.id }
    );

    // Send email
    await sendPasswordResetEmail(emailLower, profile?.full_name || "User", resetToken);

    return successResponse({ message: "If an account exists, a reset email has been sent" });
  } catch (error) {
    context.error("Forgot password error:", error);
    return errorResponse(500, "Internal server error");
  }
}

app.http("auth-forgot-password", {
  methods: ["POST", "OPTIONS"],
  route: "auth/forgot-password",
  authLevel: "anonymous",
  handler: forgotPassword,
});
