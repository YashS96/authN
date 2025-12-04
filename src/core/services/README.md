# Services

Services contain the **business logic implementation**. They implement inbound ports and depend on outbound ports (via dependency injection).

## Structure

```
services/
├── AuthService.ts      # Main authentication orchestration
├── TokenService.ts     # JWT operations (using jose library)
└── SessionService.ts   # Session management
```

## AuthService

The main authentication orchestrator. Coordinates between providers, sessions, and tokens.

### Constructor

```typescript
const authService = new AuthService(
  userRepository,     // IUserRepository
  sessionService,     // SessionService
  tokenService,       // TokenService
  providerRegistry    // IAuthProviderRegistry
);
```

### Methods

#### Registration

```typescript
// Register a new user with email/password
const result = await authService.register({
  email: "user@example.com",
  password: "SecurePass123",
  roles: ["user"],
  permissions: ["read"],
  metadata: { source: "web" },
});
// Returns: { user, session }
```

#### Login

```typescript
// Email/Password login
const result = await authService.loginWithEmailPassword(
  "user@example.com",
  "SecurePass123"
);

// OAuth login
const result = await authService.loginWithOAuth(
  "google",
  "authorization-code",
  "https://app.com/callback"
);

// Generic login (uses provider registry)
const result = await authService.login({
  method: "email_password",
  credentials: { email, password },
});
```

#### OAuth

```typescript
// Get authorization URL
const { url, state } = await authService.getOAuthUrl(
  "google",
  "https://app.com/callback"
);
// Redirect user to `url`, store `state` for CSRF protection
```

#### Session Management

```typescript
// Logout current session
await authService.logout(accessToken);

// Logout all sessions for user
await authService.logoutAll(userId);

// Refresh tokens
const result = await authService.refreshToken(refreshToken);
// Returns new { user, session } with fresh tokens
```

#### Token Operations

```typescript
// Validate and get full info
const result = await authService.validateAccessToken(token);
// { valid: boolean, claims?: JWTClaims, user?: UserJSON }

// Just extract claims
const claims = await authService.extractClaims(token);
// JWTClaims | null
```

#### User Info

```typescript
// Get current user from token
const user = await authService.getMe(accessToken);
// User | null
```

### Error Handling

```typescript
import { AuthError } from "./AuthService";

try {
  await authService.login({ ... });
} catch (err) {
  if (err instanceof AuthError) {
    console.log(err.message);    // "Invalid email or password"
    console.log(err.code);       // "INVALID_CREDENTIALS"
    console.log(err.statusCode); // 401
  }
}
```

| Error Code | Status | Description |
|------------|--------|-------------|
| USER_EXISTS | 409 | Email already registered |
| INVALID_CREDENTIALS | 401 | Wrong email/password |
| INVALID_TOKEN | 401 | Token expired or invalid |
| SESSION_NOT_FOUND | 401 | Session doesn't exist |
| USER_NOT_FOUND | 404 | User doesn't exist |
| UNSUPPORTED_METHOD | 400 | Auth method not configured |
| PROVIDER_NOT_CONFIGURED | 400 | OAuth provider not set up |

---

## TokenService

Handles JWT token operations using the **jsonwebtoken** library.

### Constructor

```typescript
const tokenService = new TokenService({
  secret: "your-secret-key",
  issuer: "authn-service",
  audience: "authn-api",
  accessTokenTTL: 900,      // 15 minutes
  refreshTokenTTL: 604800,  // 7 days
});
```

### Token Generation

```typescript
// Sign access token
const accessToken = await tokenService.signAccessToken({
  userId: "user-uuid",
  email: "user@example.com",
  sessionId: "session-uuid",
  roles: ["user"],
  permissions: ["read"],
  metadata: {},
});

// Sign refresh token
const refreshToken = await tokenService.signRefreshToken({
  userId: "user-uuid",
  email: "user@example.com",
  sessionId: "session-uuid",
});
```

### Token Verification

```typescript
// Verify and decode access token
const claims = await tokenService.verifyAccessToken(token);
// Returns JWTClaims or null if invalid

// Verify refresh token
const claims = await tokenService.verifyRefreshToken(token);

// Check if expired
const expired = await tokenService.isExpired(token);
```

### JWT Claims Structure

```typescript
interface JWTClaims {
  // Standard claims
  sub: string;       // User ID
  iss: string;       // Issuer
  aud: string;       // Audience
  iat: number;       // Issued at (Unix timestamp)
  exp: number;       // Expiration (Unix timestamp)
  nbf: number;       // Not before
  jti: string;       // Unique token ID

  // Custom claims
  email: string;
  sessionId: string;
  type: "access" | "refresh";
  roles: string[];
  permissions: string[];
  metadata: Record<string, unknown>;
}
```

---

## SessionService

Manages user sessions (creation, retrieval, invalidation).

### Constructor

```typescript
const sessionService = new SessionService(
  sessionRepository,  // ISessionRepository
  tokenService        // TokenService
);
```

### Session Creation

```typescript
const session = await sessionService.createSession({
  userId: "user-uuid",
  email: "user@example.com",
  roles: ["user"],
  permissions: ["read"],
  metadata: { device: "web" },
});
```

### Session Retrieval

```typescript
// By ID
const session = await sessionService.getSessionById("session-uuid");

// By user
const sessions = await sessionService.getSessionsByUserId("user-uuid");
```

### Session Validation

```typescript
// Check if session is still valid
const valid = sessionService.isSessionValid(session);

// Check specific token validity
const accessValid = sessionService.isAccessTokenValid(session);
const refreshValid = sessionService.isRefreshTokenValid(session);
```

### Session Management

```typescript
// Refresh (creates new session with new tokens)
const newSession = await sessionService.refreshSession(oldSession);

// Invalidate single session
await sessionService.invalidateSession("session-uuid");

// Invalidate all user sessions
await sessionService.invalidateAllUserSessions("user-uuid");

// Cleanup expired sessions
await sessionService.cleanupExpiredSessions();
```

---

## Dependencies

```
jsonwebtoken: ^9.0.2  # JWT library for signing/verification
```

The services use **jsonwebtoken** for JWT operations because:
- Industry standard library
- Well-documented and widely used
- Supports all standard algorithms
- Simple API for sign/verify operations

