import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { v4 as uuidv4 } from "uuid";
import { hashPassword, createAuthTokens, generateVerificationToken } from "../../lib/auth";
import { queryOne, execute } from "../../lib/db";
import { sendVerificationEmail } from "../../lib/email";
import { corsOptionsResponse, errorResponse, successResponse } from "../../lib/cors";

interface SignupRequest {
  email: string;
  password: string;
  fullName: string;
  role?: "coach" | "client";
}

export async function signup(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  if (request.method === "OPTIONS") {
    return corsOptionsResponse();
  }

  try {
    const body = (await request.json()) as SignupRequest;
    const { email, password, fullName, role = "client" } = body;

    // Validation
    if (!email || !password || !fullName) {
      return errorResponse(400, "Email, password, and name are required");
    }

    if (password.length < 8) {
      return errorResponse(400, "Password must be at least 8 characters");
    }

    const emailLower = email.toLowerCase().trim();

    // Check if user exists
    const existingUser = await queryOne<{ id: string }>(
      `SELECT id FROM users WHERE email = @email`,
      { email: emailLower }
    );

    if (existingUser) {
      return errorResponse(409, "Email already registered");
    }

    // Create user
    const userId = uuidv4();
    const passwordHash = await hashPassword(password);
    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24);

    await execute(
      `INSERT INTO users (id, email, password_hash, email_verification_token, email_verification_expires)
       VALUES (@userId, @email, @passwordHash, @verificationToken, @verificationExpires)`,
      {
        userId,
        email: emailLower,
        passwordHash,
        verificationToken,
        verificationExpires,
      }
    );

    // Create profile
    await execute(
      `INSERT INTO profiles (user_id, email, full_name)
       VALUES (@userId, @email, @fullName)`,
      { userId, email: emailLower, fullName }
    );

    // Assign role
    await execute(`INSERT INTO user_roles (user_id, role) VALUES (@userId, @role)`, {
      userId,
      role,
    });

    // Create role-specific profile
    if (role === "coach") {
      await execute(`INSERT INTO coach_profiles (user_id) VALUES (@userId)`, { userId });
    } else {
      await execute(`INSERT INTO client_profiles (user_id) VALUES (@userId)`, { userId });
    }

    // Send verification email (non-blocking)
    sendVerificationEmail(emailLower, fullName, verificationToken).catch((err) => {
      context.error("Failed to send verification email:", err);
    });

    // Generate tokens
    const tokens = await createAuthTokens(userId, emailLower);

    // Update last login
    await execute(
      `UPDATE users SET last_login_at = SYSDATETIMEOFFSET(), login_count = 1 WHERE id = @userId`,
      { userId }
    );

    return successResponse(
      {
        user: {
          id: userId,
          email: emailLower,
          fullName,
          role,
          emailVerified: false,
        },
        ...tokens,
      },
      201
    );
  } catch (error) {
    context.error("Signup error:", error);
    return errorResponse(500, "Internal server error");
  }
}

app.http("auth-signup", {
  methods: ["POST", "OPTIONS"],
  route: "auth/signup",
  authLevel: "anonymous",
  handler: signup,
});
