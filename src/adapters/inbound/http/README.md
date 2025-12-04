# HTTP Adapter

A modular HTTP layer built on **Bun.serve()** with a middleware-based router.

## Structure

```
http/
├── app.ts              # Application factory
├── router.ts           # Router implementation
├── middlewares/        # Middleware functions
│   ├── index.ts
│   ├── types.ts        # Types & helpers
│   ├── cors.ts         # CORS handling
│   ├── logging.ts      # Request logging
│   ├── errorHandler.ts # Error handling
│   ├── rateLimit.ts    # Rate limiting
│   └── auth.ts         # Authentication
└── routes/             # Route definitions
    ├── index.ts
    ├── auth.ts         # Auth routes
    └── health.ts       # Health routes
```

## Quick Start

```typescript
import { createApp } from "./app";

const app = createApp(authService, {
  cors: { origins: "*" },
  rateLimit: { maxRequests: 100 },
  logging: { logRequests: true },
});

Bun.serve({
  port: 3000,
  fetch: app.handler(),
});
```

## Router

### Creating Routes

```typescript
import { Router } from "./router";

const router = new Router({ basePath: "/api" });

// Basic routes
router.get("/users", async (req, ctx) => {
  return json({ users: [] });
});

router.post("/users", async (req, ctx) => {
  const body = await req.json();
  return json(body, 201);
});

// With middlewares
router.get("/me", handler, [authMiddleware(authService)]);
```

### Merging Routers

```typescript
const app = new Router();
app.merge(authRouter);
app.merge(healthRouter);
```

### Getting Route List

```typescript
const routes = app.getRoutes();
// [{ method: "GET", path: "/api/health" }, ...]
```

## Middlewares

### Request Context

Every request has a context object:

```typescript
interface RequestContext {
  requestId: string;           // Unique request ID
  startTime: number;           // Request start timestamp
  user?: {                     // Set by auth middleware
    id: string;
    email: string;
    claims: JWTClaims;
  };
  metadata: Record<string, unknown>;
}
```

### Built-in Middlewares

#### CORS

```typescript
import { corsMiddleware } from "./middlewares";

app.use(corsMiddleware({
  origins: ["https://app.com"],  // or "*" for all
  methods: ["GET", "POST"],
  headers: ["Content-Type", "Authorization"],
  credentials: true,
  maxAge: 86400,
}));
```

#### Logging

```typescript
import { loggingMiddleware, requestIdMiddleware } from "./middlewares";

app.use(requestIdMiddleware());  // Adds X-Request-ID
app.use(loggingMiddleware({
  logRequests: true,
  logResponses: true,
  excludePaths: ["/api/health"],
}));
```

Output:
```
[2024-01-01T00:00:00.000Z] abc-123 --> POST /api/auth/login
[2024-01-01T00:00:00.100Z] abc-123 <-- ✓ 200 (100ms)
```

#### Error Handling

```typescript
import { errorHandlerMiddleware } from "./middlewares";

app.use(errorHandlerMiddleware({
  includeStack: process.env.NODE_ENV !== "production",
  logErrors: true,
}));
```

Handles:
- `AuthError` → Proper status code & message
- `SyntaxError` → 400 Invalid JSON
- Unknown errors → 500 with optional stack

#### Rate Limiting

```typescript
import { rateLimitMiddleware, authRateLimitMiddleware } from "./middlewares";

// Global: 100 requests per minute
app.use(rateLimitMiddleware({
  windowMs: 60 * 1000,
  maxRequests: 100,
  skipPaths: ["/api/health"],
}));

// Auth endpoints: 10 attempts per 15 minutes
router.post("/login", handler, [authRateLimitMiddleware()]);
```

Response headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1704067260
```

#### Authentication

```typescript
import { authMiddleware, optionalAuthMiddleware } from "./middlewares";

// Required auth
router.get("/me", handler, [authMiddleware(authService)]);

// Optional auth
router.get("/posts", handler, [optionalAuthMiddleware(authService)]);

// Role-based
router.delete("/users/:id", handler, [
  authMiddleware(authService),
  requireRoles("admin"),
]);

// Permission-based
router.post("/articles", handler, [
  authMiddleware(authService),
  requirePermissions("articles:create"),
]);
```

### Custom Middleware

```typescript
import type { Middleware } from "./middlewares/types";

const myMiddleware: Middleware = async (req, ctx, next) => {
  // Before handler
  console.log("Request:", req.url);
  
  // Call next middleware or handler
  const response = await next();
  
  // After handler
  console.log("Response:", response.status);
  
  return response;
};

router.get("/path", handler, [myMiddleware]);
```

## Response Helpers

```typescript
import { json, error, success } from "./middlewares/types";

// JSON response
json({ data: "value" }, 200);

// Error response
error("Not found", 404, "NOT_FOUND");

// Success (shorthand)
success({ user: {...} });
```

## Routes

### Auth Routes (`/api/auth`)

| Method | Path | Auth | Rate Limit | Description |
|--------|------|------|------------|-------------|
| POST | `/register` | ❌ | 10/15min | Register |
| POST | `/login` | ❌ | 10/15min | Login |
| GET | `/oauth/url` | ❌ | ❌ | Get OAuth URL |
| POST | `/oauth/callback` | ❌ | ❌ | OAuth callback |
| POST | `/logout` | ✅ | ❌ | Logout |
| POST | `/logout-all` | ✅ | ❌ | Logout all |
| POST | `/refresh` | ❌ | ❌ | Refresh token |
| POST | `/validate` | ❌ | ❌ | Validate token |
| GET | `/claims` | ✅ | ❌ | Get claims |
| GET | `/me` | ✅ | ❌ | Get user |
| GET | `/methods` | ❌ | ❌ | List methods |

### Health Routes (`/api`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/ready` | Readiness check |

## Adding New Routes

1. Create route file:

```typescript
// routes/users.ts
import { Router } from "../router";
import { authMiddleware } from "../middlewares";

export function createUserRoutes(userService: IUserService): Router {
  const router = new Router({ basePath: "/api/users" });

  router.get("/", async (req, ctx) => {
    const users = await userService.list();
    return json({ users });
  }, [authMiddleware]);

  return router;
}
```

2. Register in app:

```typescript
// app.ts
import { createUserRoutes } from "./routes/users";

app.merge(createUserRoutes(userService));
```

