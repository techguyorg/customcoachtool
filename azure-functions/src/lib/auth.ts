import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import { query, queryOne, execute } from "./db";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";
const REFRESH_TOKEN_EXPIRES_DAYS = parseInt(process.env.REFRESH_TOKEN_EXPIRES_DAYS || "30");

export interface JwtPayload {
  userId: string;
  email: string;
  roles: string[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyAccessToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export async function generateRefreshToken(
  userId: string,
  deviceInfo?: string,
  ipAddress?: string
): Promise<string> {
  const token = uuidv4() + "-" + crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRES_DAYS);

  await execute(
    `INSERT INTO refresh_tokens (user_id, token_hash, device_info, ip_address, expires_at)
     VALUES (@userId, @tokenHash, @deviceInfo, @ipAddress, @expiresAt)`,
    { userId, tokenHash, deviceInfo, ipAddress, expiresAt }
  );

  return token;
}

export async function validateRefreshToken(token: string): Promise<string | null> {
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const result = await queryOne<{ user_id: string }>(
    `SELECT user_id FROM refresh_tokens 
     WHERE token_hash = @tokenHash 
       AND expires_at > SYSDATETIMEOFFSET() 
       AND revoked_at IS NULL`,
    { tokenHash }
  );

  return result?.user_id || null;
}

export async function revokeRefreshToken(token: string): Promise<void> {
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  await execute(
    `UPDATE refresh_tokens SET revoked_at = SYSDATETIMEOFFSET() WHERE token_hash = @tokenHash`,
    { tokenHash }
  );
}

export async function revokeAllUserTokens(userId: string): Promise<void> {
  await execute(
    `UPDATE refresh_tokens SET revoked_at = SYSDATETIMEOFFSET() WHERE user_id = @userId AND revoked_at IS NULL`,
    { userId }
  );
}

export async function getUserRoles(userId: string): Promise<string[]> {
  const roles = await query<{ role: string }>(
    `SELECT role FROM user_roles WHERE user_id = @userId`,
    { userId }
  );
  return roles.map((r) => r.role);
}

export async function createAuthTokens(userId: string, email: string): Promise<AuthTokens> {
  const roles = await getUserRoles(userId);
  const accessToken = generateAccessToken({ userId, email, roles });
  const refreshToken = await generateRefreshToken(userId);

  return {
    accessToken,
    refreshToken,
    expiresIn: 15 * 60, // 15 minutes in seconds
  };
}

export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function generateResetToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7);
}

export async function validateBearerToken(authHeader: string | null): Promise<JwtPayload | null> {
  const token = extractBearerToken(authHeader);
  if (!token) return null;
  return verifyAccessToken(token);
}
