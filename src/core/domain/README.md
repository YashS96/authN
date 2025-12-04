# Domain

The domain layer is the innermost layer containing business entities, value objects, types, and validation schemas.

## Structure

```
domain/
├── entities/           # Business entities
│   ├── User.ts
│   └── Session.ts
├── value-objects/      # Immutable value types
│   ├── Email.ts
│   ├── Password.ts
│   ├── UserId.ts
│   ├── SessionId.ts
│   ├── Token.ts
│   └── credentials/    # Auth-specific value objects
│       ├── EmailPasswordCredentials.ts
│       ├── OAuthCredentials.ts
│       └── ApiKey.ts
├── types/              # Shared type definitions
│   └── index.ts
└── schemas/            # Validation schemas
    └── index.ts
```

## Entities

### User

Represents an authenticated user in the system.

```typescript
interface User {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Session

Represents an active authentication session.

```typescript
interface Session {
  id: string;
  userId: string;
  email: string;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: Date;
  refreshTokenExpiresAt: Date;
  roles: string[];
  permissions: string[];
  metadata: Record<string, unknown>;
  createdAt: Date;
}
```

## Value Objects

Value objects are **immutable** and validated on creation.

### Email

```typescript
import { Email, EmailSchema } from "./value-objects/Email";

// Validation
const result = EmailSchema.validate("user@example.com");
// { valid: true }

// Creation
const email = Email.create("user@example.com");
email.value; // "user@example.com" (normalized)
```

### Password

```typescript
import { Password, PasswordSchema } from "./value-objects/Password";

// Validation with custom requirements
const result = PasswordSchema.validate("MyPass123", {
  minLength: 8,
  requireUppercase: true,
  requireNumbers: true,
});

// Hashing (uses Argon2id)
const password = await Password.hash("MyPass123");
await password.verify("MyPass123"); // true
```

### UserId / SessionId

```typescript
import { UserId, UserIdSchema } from "./value-objects/UserId";

// Generate new
const id = UserId.generate();

// Create from existing
const id = UserId.create("550e8400-e29b-41d4-a716-446655440000");

// Validation
UserIdSchema.validate("not-a-uuid"); // { valid: false, error: "Invalid UUID format" }
```

## Credential Schemas

### EmailPasswordCredentials

```typescript
import { EmailPasswordCredentialsSchema } from "./value-objects/credentials";

const result = EmailPasswordCredentialsSchema.validate({
  email: "user@example.com",
  password: "SecurePass123",
});

if (result.valid) {
  console.log(result.data); // { email, password }
}
```

### OAuthCredentials

```typescript
import { OAuthCredentialsSchema, PKCESchema } from "./value-objects/credentials";

// Validate OAuth callback
const result = OAuthCredentialsSchema.validate({
  provider: "google",
  code: "auth-code",
  redirectUri: "https://app.com/callback",
  state: "csrf-state",
});

// Generate PKCE challenge
const pkce = await PKCESchema.generate();
// { verifier: "...", challenge: "..." }
```

### ApiKey

```typescript
import { ApiKeySchema } from "./value-objects/credentials";

// Generate new API key
const key = ApiKeySchema.generate(); // "ak_abc123..."

// Validate format
ApiKeySchema.validate("ak_abc123..."); // { valid: true }

// Hash for storage
const hash = await ApiKeySchema.hash(key);
```

## Types

All shared types are in `types/index.ts`:

```typescript
// Auth methods
type AuthMethod = "email_password" | "google" | "github" | "apple" | "api_key";
type OAuthProvider = "google" | "github" | "apple";

// DTOs
interface RegisterDTO { email, password, roles?, permissions?, metadata? }
interface LoginDTO { method, credentials }

// Results
interface AuthResult { user, session }
interface TokenValidationResult { valid, claims?, user? }

// JWT
interface JWTClaims { sub, email, sessionId, roles, permissions, ... }
interface JWTConfig { secret, issuer, audience, accessTokenTTL, refreshTokenTTL }
```

## Schemas

Unified validation schemas:

```typescript
import { Schemas } from "./schemas";

// Validate registration
const result = Schemas.RegisterUser.validate({
  email: "user@example.com",
  password: "SecurePass123",
});

// Validate refresh token
const result = Schemas.RefreshToken.validate({
  refreshToken: "eyJ..."
});

// Available schemas
Schemas.Email
Schemas.Password
Schemas.UserId
Schemas.SessionId
Schemas.JWT
Schemas.EmailPasswordCredentials
Schemas.OAuthCredentials
Schemas.ApiKey
Schemas.RegisterUser
Schemas.RefreshToken
```

