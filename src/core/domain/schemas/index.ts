// ==================== BASE TYPES ====================

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Note: Value object schemas have been removed
// Domain layer now contains only pure type definitions
// Validation logic should be implemented in the service layer

// ==================== JWT CONSTRAINTS ====================

export const JWT_CONSTRAINTS = {
  PARTS_COUNT: 3,
  SEPARATOR: ".",
} as const;

// ==================== REGISTER USER SCHEMA ====================

export interface RegisterUserInput {
  email: string;
  password: string;
  roles?: string[];
  permissions?: string[];
  metadata?: Record<string, unknown>;
}

export const RegisterUserSchema = {
  validate(input: unknown): { valid: boolean; data?: RegisterUserInput; error?: string } {
    if (!input || typeof input !== "object") {
      return { valid: false, error: "Invalid input object" };
    }

    const obj = input as Record<string, unknown>;

    // Basic email validation
    if (typeof obj.email !== "string" || !obj.email.includes("@")) {
      return { valid: false, error: "Valid email is required" };
    }

    // Basic password validation
    if (typeof obj.password !== "string" || obj.password.length < 8) {
      return { valid: false, error: "Password must be at least 8 characters" };
    }

    if (obj.roles !== undefined && !Array.isArray(obj.roles)) {
      return { valid: false, error: "Roles must be an array" };
    }

    if (obj.permissions !== undefined && !Array.isArray(obj.permissions)) {
      return { valid: false, error: "Permissions must be an array" };
    }

    return {
      valid: true,
      data: {
        email: obj.email.toLowerCase().trim(),
        password: obj.password as string,
        roles: obj.roles as string[] | undefined,
        permissions: obj.permissions as string[] | undefined,
        metadata: obj.metadata as Record<string, unknown> | undefined,
      },
    };
  },
};

// ==================== REFRESH TOKEN SCHEMA ====================

export interface RefreshTokenInput {
  refreshToken: string;
}

export const RefreshTokenSchema = {
  validate(input: unknown): { valid: boolean; data?: RefreshTokenInput; error?: string } {
    if (!input || typeof input !== "object") {
      return { valid: false, error: "Invalid input object" };
    }

    const obj = input as Record<string, unknown>;
    const token = (obj.refreshToken ?? obj.refresh_token) as string;

    // Basic JWT format validation
    if (typeof token !== "string" || token.split(".").length !== 3) {
      return { valid: false, error: "Valid refresh token is required" };
    }

    return {
      valid: true,
      data: { refreshToken: token },
    };
  },
};

// ==================== UNIFIED SCHEMAS EXPORT ====================

export const Schemas = {
  // DTOs (Input validation only)
  RegisterUser: RegisterUserSchema,
  RefreshToken: RefreshTokenSchema,
} as const;

export default Schemas;
