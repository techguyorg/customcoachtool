import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { queryOne, execute } from "../../lib/db";
import { corsOptionsResponse, errorResponse, successResponse } from "../../lib/cors";

interface VerifyEmailRequest {
  token: string;
}

export async function verifyEmail(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  if (request.method === "OPTIONS") {
    return corsOptionsResponse();
  }

  try {
    const body = (await request.json()) as VerifyEmailRequest;
    const { token } = body;

    if (!token) {
      return errorResponse(400, "Verification token is required");
    }

    // Find user with valid verification token
    const user = await queryOne<{ id: string; email_verified: boolean }>(
      `SELECT id, email_verified FROM users 
       WHERE email_verification_token = @token 
         AND email_verification_expires > SYSDATETIMEOFFSET()`,
      { token }
    );

    if (!user) {
      return errorResponse(400, "Invalid or expired verification token");
    }

    if (user.email_verified) {
      return successResponse({ message: "Email already verified" });
    }

    // Mark email as verified
    await execute(
      `UPDATE users 
       SET email_verified = 1, 
           email_verification_token = NULL, 
           email_verification_expires = NULL 
       WHERE id = @userId`,
      { userId: user.id }
    );

    return successResponse({ message: "Email verified successfully" });
  } catch (error) {
    context.error("Verify email error:", error);
    return errorResponse(500, "Internal server error");
  }
}

app.http("auth-verify-email", {
  methods: ["POST", "OPTIONS"],
  route: "auth/verify-email",
  authLevel: "anonymous",
  handler: verifyEmail,
});
