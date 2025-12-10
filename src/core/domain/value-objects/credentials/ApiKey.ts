// ==================== API KEY ====================

/**
 * API Key entity
 */
export interface ApiKey {
  hash: string;
  userId: string;
  name: string;
  scopes: string[];
  expiresAt: Date | null;
  createdAt: Date;
}

/**
 * API Key credentials for authentication
 */
export interface ApiKeyCredentials {
  apiKey: string;
}

/**
 * API Key configuration constants
 */
export const API_KEY_CONSTRAINTS = {
  PREFIX: "ak_",
  KEY_LENGTH: 32,
  KEY_REGEX: /^ak_[a-f0-9]{64}$/,
  MASK_PREFIX_LENGTH: 10,
  MASK_SUFFIX_LENGTH: 4,
} as const;
