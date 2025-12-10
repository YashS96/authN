import type { User, UserJSON, Session, SessionJSON } from "../domain";
import { PASSWORD_HASH_CONFIG } from "../domain";

// ==================== USER MAPPERS ====================

export async function createUser(params: {
  email: string;
  plainPassword: string;
}): Promise<User> {
  const passwordHash = await Bun.password.hash(params.plainPassword, {
    algorithm: PASSWORD_HASH_CONFIG.algorithm,
    memoryCost: PASSWORD_HASH_CONFIG.memoryCost,
    timeCost: PASSWORD_HASH_CONFIG.timeCost,
  });

  return {
    id: crypto.randomUUID(),
    email: params.email.toLowerCase().trim(),
    passwordHash,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export function userToJSON(user: User): UserJSON {
  return {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export async function verifyUserPassword(user: User, plainPassword: string): Promise<boolean> {
  return Bun.password.verify(plainPassword, user.passwordHash);
}

// ==================== SESSION MAPPERS ====================

export function sessionToJSON(session: Session): SessionJSON {
  return {
    id: session.id,
    userId: session.userId,
    accessToken: session.accessToken,
    accessTokenExpiresAt: session.accessTokenExpiresAt.toISOString(),
    refreshToken: session.refreshToken,
    refreshTokenExpiresAt: session.refreshTokenExpiresAt.toISOString(),
    createdAt: session.createdAt.toISOString(),
  };
}

export function isSessionExpired(session: Session): boolean {
  return new Date() > session.refreshTokenExpiresAt;
}

export function isAccessTokenExpired(session: Session): boolean {
  return new Date() > session.accessTokenExpiresAt;
}

export function isRefreshTokenExpired(session: Session): boolean {
  return new Date() > session.refreshTokenExpiresAt;
}

