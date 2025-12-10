// ==================== SESSION ENTITY ====================

/**
 * Session entity - represents an authenticated user session
 */
export interface Session {
  id: string;
  userId: string;
  email: string;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: Date;
  refreshTokenExpiresAt: Date;
  roles: string[];
  permissions: string[];
  metadata: Record<string, unknown>;
  createdAt: Date;
}

/**
 * Input for creating a new session
 */
export interface SessionCreateInput {
  id?: string;
  userId: string;
  email: string;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: Date;
  refreshTokenExpiresAt: Date;
  roles?: string[];
  permissions?: string[];
  metadata?: Record<string, unknown>;
  createdAt?: Date;
}

/**
 * Session JSON representation (for API responses)
 */
export interface SessionJSON {
  id: string;
  userId: string;
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
  createdAt: string;
}

/**
 * Session storage data (for cache/database persistence)
 */
export interface SessionStorageData {
  id: string;
  userId: string;
  email: string;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
  roles: string[];
  permissions: string[];
  metadata: Record<string, unknown>;
  createdAt: string;
}
