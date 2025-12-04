/**
 * Error handling module for the authentication service.
 * 
 * This module provides a comprehensive set of HTTP error classes and utilities
 * for consistent error handling throughout the application.
 * 
 * @example Basic Usage
 * 
 * @example Using Error Classes Directly
 * ```ts
 * import { InvalidTokenError, ValidationError } from '@/utils/errors';
 * 
 * throw new InvalidTokenError("Token malformed");
 * throw ValidationError.fromField("email", "Invalid format");
 * ```
 */

// ==================== TYPES ====================
export type {
  ErrorDetails,
  ValidationErrorItem,
  AppErrorJSON,
} from "./types/types";

// ==================== BASE ERROR ====================
export { AppError, isAppError } from "./types/base-error";

// ==================== CLIENT ERRORS (4xx) ====================
export {
  // 400
  BadRequestError,
  ValidationError,
  InvalidInputError,
  InvalidJsonError,
  MissingParameterError,
  // 401
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
  // 403
  ForbiddenError,
  InsufficientPermissionsError,
  InsufficientRoleError,
  AccountDisabledError,
  AccountLockedError,
  EmailNotVerifiedError,
  AccessDeniedError,
  // 404
  NotFoundError,
  UserNotFoundError,
  RouteNotFoundError,
  // 405
  MethodNotAllowedError,
  // 409
  ConflictError,
  UserAlreadyExistsError,
  DuplicateResourceError,
  // 422
  UnprocessableEntityError,
  PasswordTooWeakError,
  InvalidEmailFormatError,
  // 429
  TooManyRequestsError,
  RateLimitExceededError,
  LoginAttemptsExceededError,
} from "./types/client-errors";

// ==================== SERVER ERRORS (5xx) ====================
export {
  // 500
  InternalServerError,
  DatabaseError,
  CacheError,
  // 502
  BadGatewayError,
  OAuthProviderError,
  // 503
  ServiceUnavailableError,
  DatabaseUnavailableError,
  CacheUnavailableError,
} from "./types/server-errors";

// ==================== ERROR FACTORY ====================
export { Errors } from "./factory";

// ==================== DEFAULT EXPORT ====================
export { Errors as default } from "./factory";
