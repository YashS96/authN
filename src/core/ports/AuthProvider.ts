import type {
  AuthMethod,
  AuthenticatedUser,
  OAuthCredentials,
  OAuthTokens,
  OAuthUserInfo,
} from "../domain/types";

/**
 * Base outbound port for authentication providers.
 */
export interface IAuthProvider {
  readonly method: AuthMethod;
  authenticate(credentials: unknown): Promise<AuthenticatedUser>;
}

/**
 * Outbound port for email/password authentication.
 */
export interface IEmailPasswordProvider extends IAuthProvider {
  readonly method: "email_password";
  authenticate(credentials: { email: string; password: string }): Promise<AuthenticatedUser>;
}

/**
 * Outbound port for OAuth authentication.
 */
export interface IOAuthProvider extends IAuthProvider {
  readonly method: "google" | "github" | "apple";

  getAuthorizationUrl(params: {
    redirectUri: string;
    state: string;
    scopes?: string[];
    codeChallenge?: string;
  }): string;

  exchangeCode(credentials: OAuthCredentials): Promise<OAuthTokens>;
  getUserInfo(accessToken: string): Promise<OAuthUserInfo>;
  authenticate(credentials: OAuthCredentials): Promise<AuthenticatedUser>;
}

/**
 * Outbound port for API key authentication.
 */
export interface IApiKeyProvider extends IAuthProvider {
  readonly method: "api_key";
  authenticate(credentials: { apiKey: string }): Promise<AuthenticatedUser>;
  generateApiKey(userId: string, name: string, scopes?: string[]): Promise<string>;
  revokeApiKey(apiKey: string): Promise<void>;
  listApiKeys(userId: string): Promise<Array<{ name: string; createdAt: Date; lastUsed?: Date }>>;
}

/**
 * Outbound port for provider registry.
 */
export interface IAuthProviderRegistry {
  register(provider: IAuthProvider): void;
  get(method: AuthMethod): IAuthProvider | undefined;
  has(method: AuthMethod): boolean;
  list(): AuthMethod[];
}
