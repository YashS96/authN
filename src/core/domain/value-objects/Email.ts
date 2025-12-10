// ==================== EMAIL VALUE OBJECT ====================

/**
 * Email value object - represents an email address
 */
export interface Email {
  readonly value: string;
}

/**
 * Email validation constraints
 */
export const EMAIL_CONSTRAINTS = {
  REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  MAX_LENGTH: 255,
} as const;
