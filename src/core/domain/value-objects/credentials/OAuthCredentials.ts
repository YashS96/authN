// ==================== OAUTH CREDENTIALS ====================

import type { OAuthProvider } from "../../types";

/**
 * OAuth credentials for authentication
 */
export interface OAuthCredentials {
  provider: OAuthProvider;
  code: string;
  redirectUri: string;
  state: string;
  codeVerifier?: string;
}

/**
 * OAuth state for CSRF protection
 */
export interface OAuthState {
  value: string;
  provider: OAuthProvider;
  redirectUri: string;
  codeChallenge?: string;
  expiresAt: Date;
}

/**
 * PKCE (Proof Key for Code Exchange) pair
 */
export interface PKCEPair {
  verifier: string;
  challenge: string;
}

/**
 * OAuth configuration constants
 */
export const OAUTH_CONSTRAINTS = {
  VALID_PROVIDERS: ["google", "github", "apple"] as const,
  STATE_TTL_SECONDS: 600, // 10 minutes
  PKCE_VERIFIER_LENGTH: 32,
} as const;
