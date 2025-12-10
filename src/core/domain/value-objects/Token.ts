// ==================== TOKEN VALUE OBJECT ====================

/**
 * Token value object - represents an authentication token
 */
export interface Token {
  readonly value: string;
  readonly expiresAt: Date;
}

/**
 * Token constraints
 */
export const TOKEN_CONSTRAINTS = {
  MIN_LENGTH: 32,
  DEFAULT_LENGTH: 32,
} as const;
