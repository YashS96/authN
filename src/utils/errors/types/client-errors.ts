import { AppError } from "./base-error";
import type { ErrorDetails, ValidationErrorItem } from "./types";

// ==================== 400 BAD REQUEST ====================

export class BadRequestError extends AppError {
  constructor(message = "Bad request", details?: ErrorDetails) {
    super(message, 400, "BAD_REQUEST", details);
  }
}

export class ValidationError extends AppError {
  public readonly errors?: ValidationErrorItem[];

  constructor(
    message = "Validation failed",
    errors?: ValidationErrorItem[]
  ) {
    super(message, 400, "VALIDATION_ERROR", { errors });
    this.errors = errors;
  }

  static fromField(field: string, message: string): ValidationError {
    return new ValidationError(message, [{ field, message }]);
  }

  static fromFields(errors: ValidationErrorItem[]): ValidationError {
    return new ValidationError("Validation failed", errors);
  }
}

export class InvalidInputError extends AppError {
  constructor(message = "Invalid input", details?: ErrorDetails) {
    super(message, 400, "INVALID_INPUT", details);
  }
}

export class InvalidJsonError extends AppError {
  constructor(message = "Invalid JSON in request body") {
    super(message, 400, "INVALID_JSON");
  }
}

export class MissingParameterError extends AppError {
  constructor(parameter: string) {
    super(`Missing required parameter: ${parameter}`, 400, "MISSING_PARAMETER", {
      parameter,
    });
  }
}

// ==================== 401 UNAUTHORIZED ====================

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized", details?: ErrorDetails) {
    super(message, 401, "UNAUTHORIZED", details);
  }
}

export class InvalidCredentialsError extends AppError {
  constructor(message = "Invalid email or password") {
    super(message, 401, "INVALID_CREDENTIALS");
  }
}

export class InvalidTokenError extends AppError {
  constructor(message = "Invalid or malformed token") {
    super(message, 401, "INVALID_TOKEN");
  }
}

export class TokenExpiredError extends AppError {
  constructor(message = "Token has expired") {
    super(message, 401, "TOKEN_EXPIRED");
  }
}

export class TokenRevokedError extends AppError {
  constructor(message = "Token has been revoked") {
    super(message, 401, "TOKEN_REVOKED");
  }
}

export class SessionExpiredError extends AppError {
  constructor(message = "Session has expired") {
    super(message, 401, "SESSION_EXPIRED");
  }
}

export class SessionNotFoundError extends AppError {
  constructor(message = "Session not found") {
    super(message, 401, "SESSION_NOT_FOUND");
  }
}

export class AuthenticationRequiredError extends AppError {
  constructor(message = "Authentication required") {
    super(message, 401, "AUTHENTICATION_REQUIRED");
  }
}

export class InvalidApiKeyError extends AppError {
  constructor(message = "Invalid API key") {
    super(message, 401, "INVALID_API_KEY");
  }
}

export class ApiKeyExpiredError extends AppError {
  constructor(message = "API key has expired") {
    super(message, 401, "API_KEY_EXPIRED");
  }
}

// ==================== 403 FORBIDDEN ====================

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden", details?: ErrorDetails) {
    super(message, 403, "FORBIDDEN", details);
  }
}

export class InsufficientPermissionsError extends AppError {
  constructor(requiredPermissions?: string[]) {
    super("Insufficient permissions", 403, "INSUFFICIENT_PERMISSIONS", {
      requiredPermissions,
    });
  }
}

export class InsufficientRoleError extends AppError {
  constructor(requiredRoles?: string[]) {
    super("Insufficient role", 403, "INSUFFICIENT_ROLE", {
      requiredRoles,
    });
  }
}

export class AccountDisabledError extends AppError {
  constructor(message = "Account has been disabled") {
    super(message, 403, "ACCOUNT_DISABLED");
  }
}

export class AccountLockedError extends AppError {
  public readonly unlockAt?: Date;

  constructor(message = "Account is locked", unlockAt?: Date) {
    super(message, 403, "ACCOUNT_LOCKED", {
      unlockAt: unlockAt?.toISOString(),
    });
    this.unlockAt = unlockAt;
  }
}

export class EmailNotVerifiedError extends AppError {
  constructor(message = "Email address not verified") {
    super(message, 403, "EMAIL_NOT_VERIFIED");
  }
}

export class AccessDeniedError extends AppError {
  constructor(resource?: string) {
    super(
      resource ? `Access denied to ${resource}` : "Access denied",
      403,
      "ACCESS_DENIED",
      { resource }
    );
  }
}

// ==================== 404 NOT FOUND ====================

export class NotFoundError extends AppError {
  constructor(resource = "Resource", id?: string) {
    super(
      id ? `${resource} with ID '${id}' not found` : `${resource} not found`,
      404,
      "NOT_FOUND",
      { resource, id }
    );
  }
}

export class UserNotFoundError extends AppError {
  constructor(identifier?: string) {
    super(
      identifier ? `User '${identifier}' not found` : "User not found",
      404,
      "USER_NOT_FOUND"
    );
  }
}

export class RouteNotFoundError extends AppError {
  constructor(path: string, method: string) {
    super(`Route ${method} ${path} not found`, 404, "ROUTE_NOT_FOUND", {
      path,
      method,
    });
  }
}

// ==================== 405 METHOD NOT ALLOWED ====================

export class MethodNotAllowedError extends AppError {
  constructor(method: string, allowedMethods?: string[]) {
    super(`Method ${method} not allowed`, 405, "METHOD_NOT_ALLOWED", {
      method,
      allowedMethods,
    });
  }
}

// ==================== 409 CONFLICT ====================

export class ConflictError extends AppError {
  constructor(message = "Conflict", details?: ErrorDetails) {
    super(message, 409, "CONFLICT", details);
  }
}

export class UserAlreadyExistsError extends AppError {
  constructor(email?: string) {
    super(
      email
        ? `User with email '${email}' already exists`
        : "User already exists",
      409,
      "USER_ALREADY_EXISTS"
    );
  }
}

export class DuplicateResourceError extends AppError {
  constructor(resource: string, field?: string) {
    super(
      field
        ? `${resource} with this ${field} already exists`
        : `${resource} already exists`,
      409,
      "DUPLICATE_RESOURCE",
      { resource, field }
    );
  }
}

// ==================== 422 UNPROCESSABLE ENTITY ====================

export class UnprocessableEntityError extends AppError {
  constructor(message = "Unprocessable entity", details?: ErrorDetails) {
    super(message, 422, "UNPROCESSABLE_ENTITY", details);
  }
}

export class PasswordTooWeakError extends AppError {
  constructor(requirements?: string[]) {
    super("Password does not meet requirements", 422, "PASSWORD_TOO_WEAK", {
      requirements,
    });
  }
}

export class InvalidEmailFormatError extends AppError {
  constructor(email?: string) {
    super("Invalid email format", 422, "INVALID_EMAIL_FORMAT", { email });
  }
}

// ==================== 429 TOO MANY REQUESTS ====================

export class TooManyRequestsError extends AppError {
  public readonly retryAfter: number;

  constructor(message = "Too many requests", retryAfter = 60) {
    super(message, 429, "TOO_MANY_REQUESTS", { retryAfter });
    this.retryAfter = retryAfter;
  }
}

export class RateLimitExceededError extends AppError {
  public readonly retryAfter: number;
  public readonly limit: number;

  constructor(limit: number, retryAfter: number) {
    super(
      `Rate limit exceeded. Maximum ${limit} requests allowed.`,
      429,
      "RATE_LIMIT_EXCEEDED",
      { limit, retryAfter }
    );
    this.retryAfter = retryAfter;
    this.limit = limit;
  }
}

export class LoginAttemptsExceededError extends AppError {
  public readonly unlockAt?: Date;

  constructor(maxAttempts: number, unlockAt?: Date) {
    super(
      `Maximum login attempts (${maxAttempts}) exceeded`,
      429,
      "LOGIN_ATTEMPTS_EXCEEDED",
      { maxAttempts, unlockAt: unlockAt?.toISOString() }
    );
    this.unlockAt = unlockAt;
  }
}

