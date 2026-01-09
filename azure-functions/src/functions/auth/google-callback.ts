import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { v4 as uuidv4 } from "uuid";
import { exchangeCodeForTokens, getGoogleUserInfo } from "../../lib/google-oauth";
import { createAuthTokens } from "../../lib/auth";
import { queryOne, execute, query } from "../../lib/db";
import { corsOptionsResponse, errorResponse, successResponse } from "../../lib/cors";

const APP_URL = process.env.APP_URL || "https://customcoachpro.azurewebsites.net";

interface GoogleCallbackRequest {
  code: string;
  role?: "coach" | "client";
}

export async function googleAuthCallback(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  if (request.method === "OPTIONS") {
    return corsOptionsResponse();
  }

  try {
    const body = (await request.json()) as GoogleCallbackRequest;
    const { code, role = "client" } = body;

    if (!code) {
      return errorResponse(400, "Authorization code is required");
    }

    const redirectUri = `${APP_URL}/auth/google/callback`;

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code, redirectUri);
    const googleUser = await getGoogleUserInfo(tokens.access_token);

    // Check if user exists by Google ID
    let user = await queryOne<{ id: string; email: string }>(
      `SELECT id, email FROM users WHERE google_id = @googleId`,
      { googleId: googleUser.id }
    );

    // If not, check by email
    if (!user) {
      user = await queryOne<{ id: string; email: string }>(
        `SELECT id, email FROM users WHERE email = @email`,
        { email: googleUser.email.toLowerCase() }
      );

      if (user) {
        // Link Google account to existing user
        await execute(
          `UPDATE users SET google_id = @googleId, email_verified = 1 WHERE id = @userId`,
          { googleId: googleUser.id, userId: user.id }
        );
      }
    }

    // Create new user if doesn't exist
    if (!user) {
      const userId = uuidv4();

      await execute(
        `INSERT INTO users (id, email, google_id, email_verified)
         VALUES (@userId, @email, @googleId, 1)`,
        { userId, email: googleUser.email.toLowerCase(), googleId: googleUser.id }
      );

      await execute(
        `INSERT INTO profiles (user_id, email, full_name, avatar_url)
         VALUES (@userId, @email, @fullName, @avatarUrl)`,
        {
          userId,
          email: googleUser.email.toLowerCase(),
          fullName: googleUser.name,
          avatarUrl: googleUser.picture,
        }
      );

      await execute(`INSERT INTO user_roles (user_id, role) VALUES (@userId, @role)`, {
        userId,
        role,
      });

      if (role === "coach") {
        await execute(`INSERT INTO coach_profiles (user_id) VALUES (@userId)`, { userId });
      } else {
        await execute(`INSERT INTO client_profiles (user_id) VALUES (@userId)`, { userId });
      }

      user = { id: userId, email: googleUser.email.toLowerCase() };
    }

    // Update last login
    await execute(
      `UPDATE users SET last_login_at = SYSDATETIMEOFFSET(), login_count = login_count + 1 WHERE id = @userId`,
      { userId: user.id }
    );

    // Generate our JWT tokens
    const authTokens = await createAuthTokens(user.id, user.email);

    // Get profile info
    const profile = await queryOne<{ full_name: string; avatar_url: string }>(
      `SELECT full_name, avatar_url FROM profiles WHERE user_id = @userId`,
      { userId: user.id }
    );

    const roles = await query<{ role: string }>(
      `SELECT role FROM user_roles WHERE user_id = @userId`,
      { userId: user.id }
    );

    const primaryRole = roles.length > 0 ? roles[0].role : role;

    return successResponse({
      user: {
        id: user.id,
        email: user.email,
        fullName: profile?.full_name || googleUser.name,
        avatarUrl: profile?.avatar_url || googleUser.picture,
        role: primaryRole,
        roles: roles.map((r) => r.role),
        emailVerified: true,
      },
      ...authTokens,
    });
  } catch (error) {
    context.error("Google auth error:", error);
    return errorResponse(500, "Authentication failed");
  }
}

app.http("auth-google-callback", {
  methods: ["POST", "OPTIONS"],
  route: "auth/google/callback",
  authLevel: "anonymous",
  handler: googleAuthCallback,
});
