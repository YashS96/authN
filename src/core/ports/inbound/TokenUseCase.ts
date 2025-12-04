import type { JWTClaims, JWTConfig } from "../../domain/types";

/**
 * Inbound port for token operations.
 */
export interface ITokenUseCase {
  // Token generation
  signAccessToken(payload: {
    userId: string;
    email: string;
    sessionId: string;
    roles?: string[];
    permissions?: string[];
    metadata?: Record<string, unknown>;
  }): Promise<string>;

  signRefreshToken(payload: {
    userId: string;
    email: string;
    sessionId: string;
  }): Promise<string>;

  // Token verification
  verifyAccessToken(token: string): Promise<JWTClaims | null>;
  verifyRefreshToken(token: string): Promise<JWTClaims | null>;

  // Token introspection
  decode(token: string): Promise<JWTClaims | null>;
  isExpired(token: string): Promise<boolean>;

  // Config
  getConfig(): JWTConfig;
}

