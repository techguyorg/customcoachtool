import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { validateBearerToken, generateVerificationToken } from "../../lib/auth";
import { queryOne, execute } from "../../lib/db";
import { sendVerificationEmail } from "../../lib/email";
import { corsOptionsResponse, errorResponse, successResponse } from "../../lib/cors";

export async function resendVerification(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  if (request.method === "OPTIONS") {
    return corsOptionsResponse();
  }

  try {
    // Validate auth
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

    if (user.email_verified) {
      return successResponse({ message: "Email already verified" });
    }

    // Get profile for name
    const profile = await queryOne<{ full_name: string }>(
      `SELECT full_name FROM profiles WHERE user_id = @userId`,
      { userId: user.id }
    );

    // Generate new verification token
    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24);

    // Update token
    await execute(
      `UPDATE users 
       SET email_verification_token = @verificationToken, 
           email_verification_expires = @verificationExpires 
       WHERE id = @userId`,
      { verificationToken, verificationExpires, userId: user.id }
    );

    // Send email
    await sendVerificationEmail(user.email, profile?.full_name || "User", verificationToken);

    return successResponse({ message: "Verification email sent" });
  } catch (error) {
    context.error("Resend verification error:", error);
    return errorResponse(500, "Internal server error");
  }
}

app.http("auth-resend-verification", {
  methods: ["POST", "OPTIONS"],
  route: "auth/resend-verification",
  authLevel: "anonymous",
  handler: resendVerification,
});
