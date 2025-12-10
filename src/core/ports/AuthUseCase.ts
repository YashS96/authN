import type { User } from "../domain/entities/User";
import type {
  AuthResult,
  TokenValidationResult,
  OAuthUrlResult,
  RegisterDTO,
  LoginDTO,
  JWTClaims,
  OAuthProvider,
} from "../domain/types";

/**
 * Inbound port for authentication use cases.
 */
export interface IAuthUseCase {
  // Registration
  register(dto: RegisterDTO): Promise<AuthResult>;

  // Login methods
  login(dto: LoginDTO): Promise<AuthResult>;
  loginWithEmailPassword(email: string, password: string): Promise<AuthResult>;
  loginWithOAuth(provider: OAuthProvider, code: string, redirectUri: string): Promise<AuthResult>;

  // OAuth
  getOAuthUrl(provider: OAuthProvider, redirectUri: string): Promise<OAuthUrlResult>;

  // Session management
  logout(accessToken: string): Promise<void>;
  logoutAll(userId: string): Promise<void>;
  refreshToken(refreshToken: string): Promise<AuthResult>;

  // Token operations
  validateAccessToken(accessToken: string): Promise<TokenValidationResult>;
  extractClaims(accessToken: string): Promise<JWTClaims | null>;

  // User info
  getMe(accessToken: string): Promise<User | null>;
}
