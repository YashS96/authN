// ==================== BASE ERROR ====================

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly timestamp: Date;
  public readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode: number,
    code: string,
    isOperational = true,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.timestamp = new Date();
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      error: this.message,
      code: this.code,
      statusCode: this.statusCode,
      timestamp: this.timestamp.toISOString(),
      ...(this.details && { details: this.details }),
    };
  }
}

// ==================== 400 BAD REQUEST ====================

export class BadRequestError extends AppError {
  constructor(message = "Bad request", details?: Record<string, unknown>) {
    super(message, 400, "BAD_REQUEST", true, details);
  }
}

export class ValidationError extends AppError {
  public readonly field?: string;
  public readonly errors?: Array<{ field: string; message: string }>;

  constructor(
    message = "Validation failed",
    errors?: Array<{ field: string; message: string }>
  ) {
    super(message, 400, "VALIDATION_ERROR", true, { errors });
    this.errors = errors;
  }

  static fromField(field: string, message: string): ValidationError {
    return new ValidationError(message, [{ field, message }]);
  }

  static fromFields(errors: Array<{ field: string; message: string }>): ValidationError {
    return new ValidationError("Validation failed", errors);
  }
}

export class InvalidInputError extends AppError {
  constructor(message = "Invalid input", details?: Record<string, unknown>) {
    super(message, 400, "INVALID_INPUT", true, details);
  }
}

export class InvalidJsonError extends AppError {
  constructor(message = "Invalid JSON in request body") {
    super(message, 400, "INVALID_JSON", true);
  }
}

export class MissingParameterError extends AppError {
  constructor(parameter: string) {
    super(`Missing required parameter: ${parameter}`, 400, "MISSING_PARAMETER", true, {
      parameter,
    });
  }
}

// ==================== 401 UNAUTHORIZED ====================

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized", details?: Record<string, unknown>) {
    super(message, 401, "UNAUTHORIZED", true, details);
  }
}

export class InvalidCredentialsError extends AppError {
  constructor(message = "Invalid email or password") {
    super(message, 401, "INVALID_CREDENTIALS", true);
  }
}

export class InvalidTokenError extends AppError {
  constructor(message = "Invalid or malformed token") {
    super(message, 401, "INVALID_TOKEN", true);
  }
}

export class TokenExpiredError extends AppError {
  constructor(message = "Token has expired") {
    super(message, 401, "TOKEN_EXPIRED", true);
  }
}

export class TokenRevokedError extends AppError {
  constructor(message = "Token has been revoked") {
    super(message, 401, "TOKEN_REVOKED", true);
  }
}

export class SessionExpiredError extends AppError {
  constructor(message = "Session has expired") {
    super(message, 401, "SESSION_EXPIRED", true);
  }
}

export class SessionNotFoundError extends AppError {
  constructor(message = "Session not found") {
    super(message, 401, "SESSION_NOT_FOUND", true);
  }
}

export class AuthenticationRequiredError extends AppError {
  constructor(message = "Authentication required") {
    super(message, 401, "AUTHENTICATION_REQUIRED", true);
  }
}

export class InvalidApiKeyError extends AppError {
  constructor(message = "Invalid API key") {
    super(message, 401, "INVALID_API_KEY", true);
  }
}

export class ApiKeyExpiredError extends AppError {
  constructor(message = "API key has expired") {
    super(message, 401, "API_KEY_EXPIRED", true);
  }
}

// ==================== 403 FORBIDDEN ====================

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden", details?: Record<string, unknown>) {
    super(message, 403, "FORBIDDEN", true, details);
  }
}

export class InsufficientPermissionsError extends AppError {
  constructor(requiredPermissions?: string[]) {
    super("Insufficient permissions", 403, "INSUFFICIENT_PERMISSIONS", true, {
      requiredPermissions,
    });
  }
}

export class InsufficientRoleError extends AppError {
  constructor(requiredRoles?: string[]) {
    super("Insufficient role", 403, "INSUFFICIENT_ROLE", true, {
      requiredRoles,
    });
  }
}

export class AccountDisabledError extends AppError {
  constructor(message = "Account has been disabled") {
    super(message, 403, "ACCOUNT_DISABLED", true);
  }
}

export class AccountLockedError extends AppError {
  public readonly unlockAt?: Date;

  constructor(message = "Account is locked", unlockAt?: Date) {
    super(message, 403, "ACCOUNT_LOCKED", true, {
      unlockAt: unlockAt?.toISOString(),
    });
    this.unlockAt = unlockAt;
  }
}

export class EmailNotVerifiedError extends AppError {
  constructor(message = "Email address not verified") {
    super(message, 403, "EMAIL_NOT_VERIFIED", true);
  }
}

export class AccessDeniedError extends AppError {
  constructor(resource?: string) {
    super(
      resource ? `Access denied to ${resource}` : "Access denied",
      403,
      "ACCESS_DENIED",
      true,
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
      true,
      { resource, id }
    );
  }
}

export class UserNotFoundError extends AppError {
  constructor(identifier?: string) {
    super(
      identifier ? `User '${identifier}' not found` : "User not found",
      404,
      "USER_NOT_FOUND",
      true
    );
  }
}

export class RouteNotFoundError extends AppError {
  constructor(path: string, method: string) {
    super(`Route ${method} ${path} not found`, 404, "ROUTE_NOT_FOUND", true, {
      path,
      method,
    });
  }
}

// ==================== 405 METHOD NOT ALLOWED ====================

export class MethodNotAllowedError extends AppError {
  constructor(method: string, allowedMethods?: string[]) {
    super(`Method ${method} not allowed`, 405, "METHOD_NOT_ALLOWED", true, {
      method,
      allowedMethods,
    });
  }
}

// ==================== 409 CONFLICT ====================

export class ConflictError extends AppError {
  constructor(message = "Conflict", details?: Record<string, unknown>) {
    super(message, 409, "CONFLICT", true, details);
  }
}

export class UserAlreadyExistsError extends AppError {
  constructor(email?: string) {
    super(
      email
        ? `User with email '${email}' already exists`
        : "User already exists",
      409,
      "USER_ALREADY_EXISTS",
      true
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
      true,
      { resource, field }
    );
  }
}

// ==================== 422 UNPROCESSABLE ENTITY ====================

export class UnprocessableEntityError extends AppError {
  constructor(message = "Unprocessable entity", details?: Record<string, unknown>) {
    super(message, 422, "UNPROCESSABLE_ENTITY", true, details);
  }
}

export class PasswordTooWeakError extends AppError {
  constructor(requirements?: string[]) {
    super("Password does not meet requirements", 422, "PASSWORD_TOO_WEAK", true, {
      requirements,
    });
  }
}

export class InvalidEmailFormatError extends AppError {
  constructor(email?: string) {
    super("Invalid email format", 422, "INVALID_EMAIL_FORMAT", true, { email });
  }
}

// ==================== 429 TOO MANY REQUESTS ====================

export class TooManyRequestsError extends AppError {
  public readonly retryAfter: number;

  constructor(message = "Too many requests", retryAfter = 60) {
    super(message, 429, "TOO_MANY_REQUESTS", true, { retryAfter });
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
      true,
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
      true,
      { maxAttempts, unlockAt: unlockAt?.toISOString() }
    );
    this.unlockAt = unlockAt;
  }
}

// ==================== 500 INTERNAL SERVER ERROR ====================

export class InternalServerError extends AppError {
  constructor(message = "Internal server error", details?: Record<string, unknown>) {
    super(message, 500, "INTERNAL_ERROR", false, details);
  }
}

export class DatabaseError extends AppError {
  constructor(message = "Database error", details?: Record<string, unknown>) {
    super(message, 500, "DATABASE_ERROR", false, details);
  }
}

export class CacheError extends AppError {
  constructor(message = "Cache error", details?: Record<string, unknown>) {
    super(message, 500, "CACHE_ERROR", false, details);
  }
}

// ==================== 502 BAD GATEWAY ====================

export class BadGatewayError extends AppError {
  constructor(message = "Bad gateway", service?: string) {
    super(message, 502, "BAD_GATEWAY", true, { service });
  }
}

export class OAuthProviderError extends AppError {
  constructor(provider: string, message = "OAuth provider error") {
    super(`${provider}: ${message}`, 502, "OAUTH_PROVIDER_ERROR", true, { provider });
  }
}

// ==================== 503 SERVICE UNAVAILABLE ====================

export class ServiceUnavailableError extends AppError {
  constructor(message = "Service temporarily unavailable", retryAfter?: number) {
    super(message, 503, "SERVICE_UNAVAILABLE", true, { retryAfter });
  }
}

export class DatabaseUnavailableError extends AppError {
  constructor(message = "Database temporarily unavailable") {
    super(message, 503, "DATABASE_UNAVAILABLE", true);
  }
}

export class CacheUnavailableError extends AppError {
  constructor(message = "Cache temporarily unavailable") {
    super(message, 503, "CACHE_UNAVAILABLE", true);
  }
}

// ==================== ERROR TYPE GUARDS ====================

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function isOperationalError(error: unknown): boolean {
  if (isAppError(error)) {
    return error.isOperational;
  }
  return false;
}

// ==================== ERROR FACTORY ====================

export const Errors = {
  // 400
  badRequest: (message?: string, details?: Record<string, unknown>) =>
    new BadRequestError(message, details),
  validation: (errors?: Array<{ field: string; message: string }>) =>
    new ValidationError("Validation failed", errors),
  invalidInput: (message?: string) => new InvalidInputError(message),
  invalidJson: () => new InvalidJsonError(),
  missingParameter: (param: string) => new MissingParameterError(param),

  // 401
  unauthorized: (message?: string) => new UnauthorizedError(message),
  invalidCredentials: () => new InvalidCredentialsError(),
  invalidToken: (message?: string) => new InvalidTokenError(message),
  tokenExpired: () => new TokenExpiredError(),
  tokenRevoked: () => new TokenRevokedError(),
  sessionExpired: () => new SessionExpiredError(),
  sessionNotFound: () => new SessionNotFoundError(),
  authRequired: () => new AuthenticationRequiredError(),
  invalidApiKey: () => new InvalidApiKeyError(),
  apiKeyExpired: () => new ApiKeyExpiredError(),

  // 403
  forbidden: (message?: string) => new ForbiddenError(message),
  insufficientPermissions: (perms?: string[]) => new InsufficientPermissionsError(perms),
  insufficientRole: (roles?: string[]) => new InsufficientRoleError(roles),
  accountDisabled: () => new AccountDisabledError(),
  accountLocked: (unlockAt?: Date) => new AccountLockedError(undefined, unlockAt),
  emailNotVerified: () => new EmailNotVerifiedError(),
  accessDenied: (resource?: string) => new AccessDeniedError(resource),

  // 404
  notFound: (resource?: string, id?: string) => new NotFoundError(resource, id),
  userNotFound: (id?: string) => new UserNotFoundError(id),
  routeNotFound: (path: string, method: string) => new RouteNotFoundError(path, method),

  // 405
  methodNotAllowed: (method: string, allowed?: string[]) =>
    new MethodNotAllowedError(method, allowed),

  // 409
  conflict: (message?: string) => new ConflictError(message),
  userExists: (email?: string) => new UserAlreadyExistsError(email),
  duplicate: (resource: string, field?: string) => new DuplicateResourceError(resource, field),

  // 422
  unprocessable: (message?: string) => new UnprocessableEntityError(message),
  passwordWeak: (requirements?: string[]) => new PasswordTooWeakError(requirements),
  invalidEmail: (email?: string) => new InvalidEmailFormatError(email),

  // 429
  tooManyRequests: (retryAfter?: number) => new TooManyRequestsError(undefined, retryAfter),
  rateLimitExceeded: (limit: number, retryAfter: number) =>
    new RateLimitExceededError(limit, retryAfter),
  loginAttemptsExceeded: (max: number, unlockAt?: Date) =>
    new LoginAttemptsExceededError(max, unlockAt),

  // 500
  internal: (message?: string) => new InternalServerError(message),
  database: (message?: string) => new DatabaseError(message),
  cache: (message?: string) => new CacheError(message),

  // 502
  badGateway: (service?: string) => new BadGatewayError(undefined, service),
  oauthProvider: (provider: string, message?: string) =>
    new OAuthProviderError(provider, message),

  // 503
  unavailable: (retryAfter?: number) => new ServiceUnavailableError(undefined, retryAfter),
  dbUnavailable: () => new DatabaseUnavailableError(),
  cacheUnavailable: () => new CacheUnavailableError(),
} as const;

export default Errors;
