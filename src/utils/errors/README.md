# Error Handling Module

A comprehensive error handling system for the authentication service with clean exports and organized structure.

## 📁 Structure

```
errors/
├── index.ts           # Main barrel export - import from here
├── factory.ts         # Errors factory object
├── README.md          # This file
└── types/
    ├── base-error.ts      # Base AppError class + type guards
    ├── client-errors.ts   # 4xx HTTP errors
    ├── server-errors.ts   # 5xx HTTP errors
    └── types.ts           # TypeScript type definitions
```

## 🚀 Quick Start

### Using the Errors Factory (Recommended)

The cleanest way to throw errors:

```typescript
import { Errors } from '@/utils/errors';

// Simple errors
throw Errors.unauthorized("Invalid token");
throw Errors.notFound("User", userId);

// Errors with details
throw Errors.validation([
  { field: "email", message: "Invalid format" },
  { field: "password", message: "Too weak" }
]);

throw Errors.rateLimitExceeded(100, 60);
```

### Using Error Classes Directly

When you need more control:

```typescript
import {
  InvalidTokenError,
  ValidationError,
  AccountLockedError
} from '@/utils/errors';

throw new InvalidTokenError("Malformed JWT");
throw ValidationError.fromField("email", "Already exists");
throw new AccountLockedError("Too many attempts", unlockDate);
```

### Type Guards

```typescript
import { isAppError } from '@/utils/errors';

try {
  // your code
} catch (error) {
  if (isAppError(error)) {
    console.log({
      status: error.statusCode,
      code: error.code,
      message: error.message,
      details: error.details
    });
  }
}
```

## 📚 Available Errors

### 400 - Bad Request
- `BadRequestError` - Generic bad request
- `ValidationError` - Validation failures (with field-level errors)
- `InvalidInputError` - Invalid user input
- `InvalidJsonError` - Malformed JSON in request
- `MissingParameterError` - Required parameter missing

### 401 - Unauthorized
- `UnauthorizedError` - Generic unauthorized
- `InvalidCredentialsError` - Wrong email/password
- `InvalidTokenError` - Invalid/malformed token
- `TokenExpiredError` - Expired token
- `TokenRevokedError` - Revoked token
- `SessionExpiredError` - Expired session
- `SessionNotFoundError` - Session doesn't exist
- `AuthenticationRequiredError` - Auth required for endpoint
- `InvalidApiKeyError` - Invalid API key
- `ApiKeyExpiredError` - Expired API key

### 403 - Forbidden
- `ForbiddenError` - Generic forbidden
- `InsufficientPermissionsError` - Missing permissions
- `InsufficientRoleError` - Missing role
- `AccountDisabledError` - Account is disabled
- `AccountLockedError` - Account is locked
- `EmailNotVerifiedError` - Email not verified
- `AccessDeniedError` - Access denied to resource

### 404 - Not Found
- `NotFoundError` - Generic not found
- `UserNotFoundError` - User doesn't exist
- `RouteNotFoundError` - Route doesn't exist

### 405 - Method Not Allowed
- `MethodNotAllowedError` - HTTP method not allowed

### 409 - Conflict
- `ConflictError` - Generic conflict
- `UserAlreadyExistsError` - User already exists
- `DuplicateResourceError` - Duplicate resource

### 422 - Unprocessable Entity
- `UnprocessableEntityError` - Generic unprocessable
- `PasswordTooWeakError` - Password doesn't meet requirements
- `InvalidEmailFormatError` - Invalid email format

### 429 - Too Many Requests
- `TooManyRequestsError` - Generic rate limit
- `RateLimitExceededError` - Rate limit exceeded
- `LoginAttemptsExceededError` - Too many login attempts

### 500 - Internal Server Error
- `InternalServerError` - Generic internal error
- `DatabaseError` - Database error
- `CacheError` - Cache error

### 502 - Bad Gateway
- `BadGatewayError` - Generic bad gateway
- `OAuthProviderError` - OAuth provider error

### 503 - Service Unavailable
- `ServiceUnavailableError` - Generic service unavailable
- `DatabaseUnavailableError` - Database unavailable
- `CacheUnavailableError` - Cache unavailable

## 🎯 Usage Examples

### Validation Errors

```typescript
// Single field
throw ValidationError.fromField("email", "Invalid format");

// Multiple fields
throw ValidationError.fromFields([
  { field: "email", message: "Required" },
  { field: "password", message: "Too short" }
]);

// Using factory
throw Errors.validation([
  { field: "name", message: "Required" }
]);
```

### Authentication Errors

```typescript
// Login failure
throw Errors.invalidCredentials();

// Token issues
throw Errors.tokenExpired();
throw Errors.invalidToken("Signature verification failed");

// Session issues
throw Errors.sessionExpired();
throw Errors.sessionNotFound();
```

### Authorization Errors

```typescript
// Permission checks
throw Errors.insufficientPermissions(["admin", "moderator"]);
throw Errors.insufficientRole(["admin"]);

// Account status
throw Errors.accountDisabled();
throw Errors.accountLocked("Too many attempts", unlockDate);
throw Errors.emailNotVerified();
```

### Rate Limiting

```typescript
// Generic rate limit
throw Errors.tooManyRequests("Slow down", 60);

// Specific rate limit
throw Errors.rateLimitExceeded(100, 60);

// Login attempts
throw Errors.loginAttemptsExceeded(5, unlockDate);
```

### Server Errors

```typescript
// Generic
throw Errors.internal("Something went wrong");

// Database
throw Errors.database("Connection failed");
throw Errors.dbUnavailable("Maintenance mode");

// External services
throw Errors.oauthProvider("Google", "Token exchange failed");
throw Errors.badGateway("Payment service");
```

## 🔧 Error Response Format

All errors serialize to a consistent JSON format:

```json
{
  "error": "Invalid email or password",
  "code": "INVALID_CREDENTIALS",
  "statusCode": 401,
  "timestamp": "2024-12-04T10:30:00.000Z",
  "details": {
    "field": "email"
  }
}
```

## 🎨 TypeScript Types

```typescript
import type {
  ErrorDetails,
  ValidationErrorItem,
  AppErrorJSON
} from '@/utils/errors';

// Custom error details
const details: ErrorDetails = {
  userId: "123",
  action: "delete"
};

// Validation items
const errors: ValidationErrorItem[] = [
  { field: "email", message: "Required" }
];
```

## 🏗️ Extending Errors

To add a new error type:

1. Add the error class to `types/client-errors.ts` or `types/server-errors.ts`
2. Export it from `index.ts`
3. Add a factory method to `factory.ts`
4. Update this README

Example:

```typescript
// In types/client-errors.ts
export class CustomError extends AppError {
  constructor(message = "Custom error") {
    super(message, 418, "CUSTOM_ERROR");
  }
}

// In factory.ts
custom: (message?: string) => new CustomError(message),

// In index.ts
export { CustomError } from "./types/client-errors";
```

## ✅ Best Practices

1. **Use the factory** - Prefer `Errors.unauthorized()` over `new UnauthorizedError()`
2. **Provide context** - Add details when helpful: `Errors.notFound("User", userId)`
3. **Consistent messaging** - Use default messages when possible
4. **Type safety** - Use `isAppError()` type guard in catch blocks
5. **Don't swallow errors** - Always handle or re-throw

## 🔍 Type Guards

```typescript
import { isAppError } from '@/utils/errors';

try {
  await someOperation();
} catch (error) {
  if (isAppError(error)) {
    // TypeScript knows this is an AppError
    logger.error({
      code: error.code,
      status: error.statusCode,
      details: error.details
    });
  } else {
    // Handle unknown errors
    logger.error("Unknown error", error);
  }
}
```

## 📦 Exports Summary

### Main Export
```typescript
import Errors from '@/utils/errors';
// or
import { Errors } from '@/utils/errors';
```

### Named Exports
```typescript
import {
  // Base
  AppError,
  
  // Type Guards
  isAppError,
  
  // Error Classes
  UnauthorizedError,
  ValidationError,
  // ... all other error classes
  
  // Types
  ErrorDetails,
  ValidationErrorItem,
  AppErrorJSON,
} from '@/utils/errors';
```

