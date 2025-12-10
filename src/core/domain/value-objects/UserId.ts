// ==================== USER ID VALUE OBJECT ====================

/**
 * UserId value object - represents a unique user identifier (UUID)
 */
export interface UserId {
  readonly value: string;
}

/**
 * UUID validation pattern
 */
export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
