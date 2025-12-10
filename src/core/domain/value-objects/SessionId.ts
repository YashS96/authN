// ==================== SESSION ID VALUE OBJECT ====================

/**
 * SessionId value object - represents a unique session identifier (UUID)
 */
export interface SessionId {
  readonly value: string;
}

/**
 * UUID validation pattern
 */
export const SESSION_UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
