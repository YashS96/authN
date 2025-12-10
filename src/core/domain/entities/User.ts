// ==================== USER ENTITY ====================

/**
 * User entity - represents a registered user in the system
 */
export interface User {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Input for creating a new user
 */
export interface UserCreateInput {
  id?: string;
  email: string;
  passwordHash: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * User JSON representation (for API responses)
 */
export interface UserJSON {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * User storage data (for database persistence)
 */
export interface UserStorageData {
  id: string;
  email: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}
