/**
 * Outbound port for token blacklist/revocation storage.
 */
export interface ITokenStore {
  // Token blacklisting
  blacklist(tokenId: string, expiresAt: Date): Promise<void>;
  isBlacklisted(tokenId: string): Promise<boolean>;

  // OAuth state
  saveOAuthState(state: string, data: { provider: string; redirectUri: string }, ttl: number): Promise<void>;
  getOAuthState(state: string): Promise<{ provider: string; redirectUri: string } | null>;
  deleteOAuthState(state: string): Promise<void>;

  // API keys
  saveApiKeyHash(hash: string, userId: string, metadata: Record<string, unknown>): Promise<void>;
  getApiKeyData(hash: string): Promise<{ userId: string; metadata: Record<string, unknown> } | null>;
  deleteApiKey(hash: string): Promise<void>;
}
