import { AppError } from "./base-error";
import type { ErrorDetails } from "./types";

// ==================== 500 INTERNAL SERVER ERROR ====================

export class InternalServerError extends AppError {
  constructor(message = "Internal server error", details?: ErrorDetails) {
    super(message, 500, "INTERNAL_ERROR", details);
  }
}

export class DatabaseError extends AppError {
  constructor(message = "Database error", details?: ErrorDetails) {
    super(message, 500, "DATABASE_ERROR", details);
  }
}

export class CacheError extends AppError {
  constructor(message = "Cache error", details?: ErrorDetails) {
    super(message, 500, "CACHE_ERROR", details);
  }
}

// ==================== 502 BAD GATEWAY ====================

export class BadGatewayError extends AppError {
  constructor(message = "Bad gateway", service?: string) {
    super(message, 502, "BAD_GATEWAY", { service });
  }
}

export class OAuthProviderError extends AppError {
  constructor(provider: string, message = "OAuth provider error") {
    super(`${provider}: ${message}`, 502, "OAUTH_PROVIDER_ERROR", { provider });
  }
}

// ==================== 503 SERVICE UNAVAILABLE ====================

export class ServiceUnavailableError extends AppError {
  constructor(message = "Service temporarily unavailable", retryAfter?: number) {
    super(message, 503, "SERVICE_UNAVAILABLE", { retryAfter });
  }
}

export class DatabaseUnavailableError extends AppError {
  constructor(message = "Database temporarily unavailable") {
    super(message, 503, "DATABASE_UNAVAILABLE");
  }
}

export class CacheUnavailableError extends AppError {
  constructor(message = "Cache temporarily unavailable") {
    super(message, 503, "CACHE_UNAVAILABLE");
  }
}

