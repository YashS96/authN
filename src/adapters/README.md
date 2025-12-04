# Adapters

Adapters connect the core domain to the outside world. They implement the **outbound ports** and expose the application through **inbound ports**.

## Structure

```
adapters/
├── inbound/                    # Driving adapters (receive requests)
│   └── http/
│       └── app.ts              # HTTP routes using Bun.serve()
└── outbound/                   # Driven adapters (external services)
    ├── database/
    │   └── postgres.ts         # PostgreSQL using Bun.sql
    ├── cache/
    │   └── redis.ts            # Redis using Bun.redis
    └── providers/
        ├── EmailPasswordProvider.ts
        ├── GoogleProvider.ts
        ├── GitHubProvider.ts
        └── ProviderRegistry.ts
```

---

## Inbound Adapters

### HTTP (`inbound/http/app.ts`)

Exposes the application via HTTP using **Bun.serve()**.

#### Route Creation

```typescript
import { createAuthRoutes, createRouter } from "./app";

const routes = createAuthRoutes(authService);
const router = createRouter(routes);

Bun.serve({
  port: 3000,
  fetch: router,
});
```

#### Available Routes

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Email/password login |
| GET | `/api/auth/oauth/url` | Get OAuth URL |
| POST | `/api/auth/oauth/callback` | OAuth callback |
| POST | `/api/auth/logout` | Logout |
| POST | `/api/auth/logout-all` | Logout all sessions |
| POST | `/api/auth/refresh` | Refresh tokens |
| POST | `/api/auth/validate` | Validate token |
| GET | `/api/auth/claims` | Extract JWT claims |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/auth/methods` | List auth methods |
| GET | `/api/health` | Health check |

#### Response Format

```typescript
// Success
{ user: {...}, session: {...} }

// Error
{ error: "message", code: "ERROR_CODE" }
```

#### CORS

All responses include CORS headers:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-API-Key
```

---

## Outbound Adapters

### PostgreSQL (`outbound/database/postgres.ts`)

Implements `IUserRepository` using **Bun.sql**.

```typescript
import { PostgresUserRepository } from "./postgres";

const userRepo = new PostgresUserRepository(
  "postgres://user:pass@localhost:5432/authn"
);

// Initialize schema
await userRepo.initialize();

// Operations
await userRepo.save(user);
const user = await userRepo.findByEmail("user@example.com");
const exists = await userRepo.exists("user@example.com");
```

#### Schema

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
```

---

### Redis (`outbound/cache/redis.ts`)

Implements `ISessionRepository` using **Bun.redis**.

```typescript
import { RedisSessionRepository } from "./redis";

const sessionRepo = new RedisSessionRepository(
  "redis://localhost:6379"
);

// Operations
await sessionRepo.save(session);
const session = await sessionRepo.findById("session-uuid");
await sessionRepo.deleteByUserId("user-uuid");
```

#### Key Structure

```
session:{id}           -> Session JSON (with TTL)
user_sessions:{userId} -> Set of session IDs
```

Sessions automatically expire via Redis TTL based on refresh token expiration.

---

### Auth Providers (`outbound/providers/`)

Implement `IAuthProvider` interface.

#### EmailPasswordProvider

```typescript
import { EmailPasswordAuthProvider } from "./EmailPasswordProvider";

const provider = new EmailPasswordAuthProvider(userRepository);
const result = await provider.authenticate({
  email: "user@example.com",
  password: "SecurePass123",
});
// Returns: AuthenticatedUser
```

#### GoogleProvider

```typescript
import { GoogleAuthProvider } from "./GoogleProvider";

const provider = new GoogleAuthProvider({
  clientId: "...",
  clientSecret: "...",
});

// Get auth URL
const url = provider.getAuthorizationUrl({
  redirectUri: "https://app.com/callback",
  state: "csrf-state",
  scopes: ["openid", "email", "profile"],
});

// Exchange code for tokens
const tokens = await provider.exchangeCode({
  code: "auth-code",
  redirectUri: "https://app.com/callback",
});

// Get user info
const userInfo = await provider.getUserInfo(tokens.accessToken);

// Full authentication flow
const result = await provider.authenticate({
  code: "auth-code",
  redirectUri: "https://app.com/callback",
});
```

#### GitHubProvider

```typescript
import { GitHubAuthProvider } from "./GitHubProvider";

const provider = new GitHubAuthProvider({
  clientId: "...",
  clientSecret: "...",
});

// Same interface as GoogleProvider
```

#### ProviderRegistry

```typescript
import { ProviderRegistry } from "./ProviderRegistry";

const registry = new ProviderRegistry();

// Register providers
registry.register(emailPasswordProvider);
registry.register(googleProvider);
registry.register(githubProvider);

// Get provider
const provider = registry.get("google");

// List available methods
const methods = registry.list();
// ["email_password", "google", "github"]
```

---

## Adding New Adapters

### New Database (e.g., MongoDB)

```typescript
// outbound/database/mongo.ts
import type { IUserRepository } from "../../../core/ports";

export class MongoUserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    // MongoDB implementation
  }
  // ... other methods
}
```

### New Auth Provider (e.g., Apple)

```typescript
// outbound/providers/AppleProvider.ts
import type { IOAuthProvider } from "../../../core/ports";

export class AppleAuthProvider implements IOAuthProvider {
  readonly method = "apple" as const;

  getAuthorizationUrl(params) { /* ... */ }
  exchangeCode(credentials) { /* ... */ }
  getUserInfo(accessToken) { /* ... */ }
  authenticate(credentials) { /* ... */ }
}
```

### New Transport (e.g., GraphQL)

```typescript
// inbound/graphql/app.ts
import type { IAuthUseCase } from "../../../core/ports";

export function createGraphQLSchema(authService: IAuthUseCase) {
  // GraphQL schema implementation
}
```

