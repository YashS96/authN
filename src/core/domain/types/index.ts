// ==================== AUTH METHOD TYPES ====================

export type AuthMethod =
  | "email_password"
  | "google"
  | "github"
  | "apple"
  | "api_key";

export type OAuthProvider = "google" | "github" | "apple";

// ==================== USER TYPES ====================

export interface AuthenticatedUser {
  id?: string;
  email: string;
  emailVerified: boolean;
  name?: string;
  picture?: string;
  provider: AuthMethod;
  providerUserId?: string;
  metadata?: Record<string, unknown>;
}

export interface UserJSON {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== SESSION TYPES ====================

export interface SessionJSON {
  id: string;
  userId: string;
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
  createdAt: string;
}

// ==================== OAUTH TYPES ====================

export interface OAuthTokens {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  expiresIn: number;
  tokenType: string;
  scope?: string;
}

export interface OAuthUserInfo {
  id: string;
  email: string;
  emailVerified: boolean;
  name?: string;
  picture?: string;
  raw: Record<string, unknown>;
}

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  scopes?: string[];
}

export interface OAuthCredentials {
  code: string;
  redirectUri: string;
  codeVerifier?: string;
}

// ==================== DTO TYPES ====================

export interface RegisterDTO {
  email: string;
  password: string;
  roles?: string[];
  permissions?: string[];
  metadata?: Record<string, unknown>;
}

export interface LoginDTO {
  method: AuthMethod;
  credentials: unknown;
}

// ==================== RESULT TYPES ====================

export interface AuthResult {
  user: UserJSON;
  session: SessionJSON;
}

export interface TokenValidationResult {
  valid: boolean;
  claims?: JWTClaims;
  user?: UserJSON;
}

export interface OAuthUrlResult {
  url: string;
  state: string;
}

// ==================== JWT TYPES ====================

export interface JWTClaims {
  sub: string;
  email: string;
  sessionId: string;
  roles: string[];
  permissions: string[];
  metadata: Record<string, unknown>;
  type: "access" | "refresh";
  iss: string;
  aud: string;
  iat: number;
  exp: number;
  nbf: number;
  jti: string;
}

export interface JWTConfig {
  secret: string;
  issuer: string;
  audience: string;
  accessTokenTTL: number;
  refreshTokenTTL: number;
}

// ==================== ERROR TYPES ====================

export interface AuthErrorData {
  message: string;
  code: string;
  statusCode: number;
}
