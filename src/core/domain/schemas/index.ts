// ==================== BASE TYPES ====================

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ==================== REEXPORT VALUE OBJECT SCHEMAS ====================

import { EmailSchema } from "../value-objects/Email";
import { PasswordSchema } from "../value-objects/Password";
import { UserIdSchema } from "../value-objects/UserId";
import { SessionIdSchema } from "../value-objects/SessionId";
import { TokenSchema } from "../value-objects/Token";
import { EmailPasswordCredentialsSchema } from "../value-objects/credentials/EmailPasswordCredentials";
import { OAuthCredentialsSchema, OAuthStateSchema, PKCESchema } from "../value-objects/credentials/OAuthCredentials";
import { ApiKeySchema, ApiKeyCredentialsSchema } from "../value-objects/credentials/ApiKey";

export {
  EmailSchema,
  PasswordSchema,
  UserIdSchema,
  SessionIdSchema,
  TokenSchema,
  EmailPasswordCredentialsSchema,
  OAuthCredentialsSchema,
  OAuthStateSchema,
  PKCESchema,
  ApiKeySchema,
  ApiKeyCredentialsSchema,
};

// ==================== JWT SCHEMA ====================

export const JWTSchema = {
  validate(token: string): { valid: boolean; error?: string } {
    if (typeof token !== "string") {
      return { valid: false, error: "JWT must be a string" };
    }

    const parts = token.split(".");
    if (parts.length !== 3) {
      return { valid: false, error: "Invalid JWT format" };
    }

    return { valid: true };
  },
};

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

    const emailResult = EmailSchema.validate(obj.email as string);
    if (!emailResult.valid) {
      return { valid: false, error: emailResult.error };
    }

    const passwordResult = PasswordSchema.validate(obj.password as string);
    if (!passwordResult.valid) {
      return { valid: false, error: passwordResult.error };
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
        email: EmailSchema.normalize(obj.email as string),
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

    const jwtResult = JWTSchema.validate(token);
    if (!jwtResult.valid) {
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
  Email: EmailSchema,
  Password: PasswordSchema,
  UserId: UserIdSchema,
  SessionId: SessionIdSchema,
  Token: TokenSchema,
  JWT: JWTSchema,
  EmailPasswordCredentials: EmailPasswordCredentialsSchema,
  OAuthCredentials: OAuthCredentialsSchema,
  OAuthState: OAuthStateSchema,
  PKCE: PKCESchema,
  ApiKey: ApiKeySchema,
  ApiKeyCredentials: ApiKeyCredentialsSchema,
  RegisterUser: RegisterUserSchema,
  RefreshToken: RefreshTokenSchema,
} as const;

export default Schemas;
