import {
    BadRequestError,
    ValidationError,
    InvalidInputError,
    InvalidJsonError,
    MissingParameterError,
    UnauthorizedError,
    InvalidCredentialsError,
    InvalidTokenError,
    TokenExpiredError,
    TokenRevokedError,
    SessionExpiredError,
    SessionNotFoundError,
    AuthenticationRequiredError,
    InvalidApiKeyError,
    ApiKeyExpiredError,
    ForbiddenError,
    InsufficientPermissionsError,
    InsufficientRoleError,
    AccountDisabledError,
    AccountLockedError,
    EmailNotVerifiedError,
    AccessDeniedError,
    NotFoundError,
    UserNotFoundError,
    RouteNotFoundError,
    MethodNotAllowedError,
    ConflictError,
    UserAlreadyExistsError,
    DuplicateResourceError,
    UnprocessableEntityError,
    PasswordTooWeakError,
    InvalidEmailFormatError,
    TooManyRequestsError,
    RateLimitExceededError,
    LoginAttemptsExceededError,
} from "./types/client-errors";

import {
    InternalServerError,
    DatabaseError,
    CacheError,
    BadGatewayError,
    OAuthProviderError,
    ServiceUnavailableError,
    DatabaseUnavailableError,
    CacheUnavailableError,
} from "./types/server-errors";

import type { ErrorDetails, ValidationErrorItem } from "./types/types";

/**
 * Factory object for creating error instances with convenience methods.
 * Provides a clean API for throwing errors throughout the application.
 * 
 * @example
 * throw Errors.unauthorized("Invalid token");
 * throw Errors.notFound("User", userId);
 * throw Errors.validation([{ field: "email", message: "Invalid format" }]);
 */
export const Errors = {
    // ==================== 400 BAD REQUEST ====================
    badRequest: (message?: string, details?: ErrorDetails) =>
        new BadRequestError(message, details),

    validation: (errors?: ValidationErrorItem[]) =>
        new ValidationError("Validation failed", errors),

    invalidInput: (message?: string, details?: ErrorDetails) =>
        new InvalidInputError(message, details),

    invalidJson: (message?: string) =>
        new InvalidJsonError(message),

    missingParameter: (param: string) =>
        new MissingParameterError(param),

    // ==================== 401 UNAUTHORIZED ====================
    unauthorized: (message?: string, details?: ErrorDetails) =>
        new UnauthorizedError(message, details),

    invalidCredentials: (message?: string) =>
        new InvalidCredentialsError(message),

    invalidToken: (message?: string) =>
        new InvalidTokenError(message),

    tokenExpired: (message?: string) =>
        new TokenExpiredError(message),

    tokenRevoked: (message?: string) =>
        new TokenRevokedError(message),

    sessionExpired: (message?: string) =>
        new SessionExpiredError(message),

    sessionNotFound: (message?: string) =>
        new SessionNotFoundError(message),

    authRequired: (message?: string) =>
        new AuthenticationRequiredError(message),

    invalidApiKey: (message?: string) =>
        new InvalidApiKeyError(message),

    apiKeyExpired: (message?: string) =>
        new ApiKeyExpiredError(message),

    // ==================== 403 FORBIDDEN ====================
    forbidden: (message?: string, details?: ErrorDetails) =>
        new ForbiddenError(message, details),

    insufficientPermissions: (requiredPermissions?: string[]) =>
        new InsufficientPermissionsError(requiredPermissions),

    insufficientRole: (requiredRoles?: string[]) =>
        new InsufficientRoleError(requiredRoles),

    accountDisabled: (message?: string) =>
        new AccountDisabledError(message),

    accountLocked: (message?: string, unlockAt?: Date) =>
        new AccountLockedError(message, unlockAt),

    emailNotVerified: (message?: string) =>
        new EmailNotVerifiedError(message),

    accessDenied: (resource?: string) =>
        new AccessDeniedError(resource),

    // ==================== 404 NOT FOUND ====================
    notFound: (resource?: string, id?: string) =>
        new NotFoundError(resource, id),

    userNotFound: (identifier?: string) =>
        new UserNotFoundError(identifier),

    routeNotFound: (path: string, method: string) =>
        new RouteNotFoundError(path, method),

    // ==================== 405 METHOD NOT ALLOWED ====================
    methodNotAllowed: (method: string, allowedMethods?: string[]) =>
        new MethodNotAllowedError(method, allowedMethods),

    // ==================== 409 CONFLICT ====================
    conflict: (message?: string, details?: ErrorDetails) =>
        new ConflictError(message, details),

    userExists: (email?: string) =>
        new UserAlreadyExistsError(email),

    duplicate: (resource: string, field?: string) =>
        new DuplicateResourceError(resource, field),

    // ==================== 422 UNPROCESSABLE ENTITY ====================
    unprocessable: (message?: string, details?: ErrorDetails) =>
        new UnprocessableEntityError(message, details),

    passwordWeak: (requirements?: string[]) =>
        new PasswordTooWeakError(requirements),

    invalidEmail: (email?: string) =>
        new InvalidEmailFormatError(email),

    // ==================== 429 TOO MANY REQUESTS ====================
    tooManyRequests: (message?: string, retryAfter?: number) =>
        new TooManyRequestsError(message, retryAfter),

    rateLimitExceeded: (limit: number, retryAfter: number) =>
        new RateLimitExceededError(limit, retryAfter),

    loginAttemptsExceeded: (maxAttempts: number, unlockAt?: Date) =>
        new LoginAttemptsExceededError(maxAttempts, unlockAt),

    // ==================== 500 INTERNAL SERVER ERROR ====================
    internal: (message?: string, details?: ErrorDetails) =>
        new InternalServerError(message, details),

    database: (message?: string, details?: ErrorDetails) =>
        new DatabaseError(message, details),

    cache: (message?: string, details?: ErrorDetails) =>
        new CacheError(message, details),

    // ==================== 502 BAD GATEWAY ====================
    badGateway: (message?: string, service?: string) =>
        new BadGatewayError(message, service),

    oauthProvider: (provider: string, message?: string) =>
        new OAuthProviderError(provider, message),

    // ==================== 503 SERVICE UNAVAILABLE ====================
    unavailable: (message?: string, retryAfter?: number) =>
        new ServiceUnavailableError(message, retryAfter),

    dbUnavailable: (message?: string) =>
        new DatabaseUnavailableError(message),

    cacheUnavailable: (message?: string) =>
        new CacheUnavailableError(message),
} as const;

