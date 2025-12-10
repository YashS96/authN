// ==================== PASSWORD VALUE OBJECT ====================

/**
 * Password value object - represents a hashed password
 */
export interface Password {
  readonly hash: string;
}

/**
 * Password requirements configuration
 */
export interface PasswordRequirements {
  minLength: number;
  maxLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
}

/**
 * Default password requirements
 */
export const DEFAULT_PASSWORD_REQUIREMENTS: PasswordRequirements = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: false,
} as const;

/**
 * Password hashing configuration
 */
export const PASSWORD_HASH_CONFIG = {
  algorithm: "argon2id" as const,
  memoryCost: 65536,
  timeCost: 3,
} as const;
