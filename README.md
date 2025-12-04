# AuthN Service

A production-ready authentication service built with **Bun**, following **Hexagonal Architecture** (Ports & Adapters pattern).

## Features

- 🔐 **Email/Password Authentication** - Traditional login with Argon2id hashing
- 🌐 **OAuth 2.0** - Google, GitHub, Apple integration
- 🎫 **JWT Tokens** - Access & refresh tokens with proper claims
- 📦 **Session Management** - Redis-backed sessions with TTL
- 🏗️ **Clean Architecture** - Hexagonal/Ports & Adapters pattern
- ⚡ **Bun Native** - Uses Bun.serve, Bun.sql, Bun.redis

## Quick Start

### Prerequisites

- [Bun](https://bun.sh) >= 1.0
- PostgreSQL
- Redis

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd authN

# Install dependencies
bun install

# Configure environment
cp .env.example .env
# Edit .env with your configuration

# Start the server
bun dev
```

### Environment Variables

```env
# Server
PORT=3000

# Database
DATABASE_URL=postgres://user:password@localhost:5432/authn

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_ISSUER=authn-service
JWT_AUDIENCE=authn-api
JWT_ACCESS_TTL=900        # 15 minutes in seconds
JWT_REFRESH_TTL=604800    # 7 days in seconds

# OAuth - Google
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# OAuth - GitHub
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

## API Reference

### Base URL

```
http://localhost:3000/api
```

### Authentication Endpoints

#### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "roles": ["user"],
  "permissions": ["read"],
  "metadata": {}
}
```

**Response (201)**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "session": {
    "id": "uuid",
    "userId": "uuid",
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "accessTokenExpiresAt": "2024-01-01T00:15:00.000Z",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshTokenExpiresAt": "2024-01-08T00:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Login (Email/Password)

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response (200)** - Same as register response

---

### OAuth Endpoints

#### Get OAuth Authorization URL

```http
GET /api/auth/oauth/url?provider=google&redirect_uri=https://yourapp.com/callback
```

**Query Parameters**
| Parameter | Required | Description |
|-----------|----------|-------------|
| provider | Yes | `google`, `github`, or `apple` |
| redirect_uri | Yes | Your callback URL |

**Response (200)**
```json
{
  "url": "https://accounts.google.com/o/oauth2/v2/auth?...",
  "state": "uuid-state-for-csrf-protection"
}
```

#### OAuth Callback

```http
POST /api/auth/oauth/callback
Content-Type: application/json

{
  "provider": "google",
  "code": "authorization-code-from-provider",
  "redirectUri": "https://yourapp.com/callback",
  "state": "uuid-state-from-url-endpoint"
}
```

**Response (200)** - Same as login response

---

### Session Management

#### Logout

```http
POST /api/auth/logout
Authorization: Bearer <access_token>
```

**Response (200)**
```json
{
  "message": "Logged out successfully"
}
```

#### Logout All Sessions

```http
POST /api/auth/logout-all
Authorization: Bearer <access_token>
```

**Response (200)**
```json
{
  "message": "Logged out from all sessions"
}
```

#### Refresh Token

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200)** - Same as login response with new tokens

---

### Token & User Info

#### Validate Token

```http
POST /api/auth/validate
Authorization: Bearer <access_token>
```

**Response (200)**
```json
{
  "valid": true,
  "claims": {
    "sub": "user-uuid",
    "email": "user@example.com",
    "sessionId": "session-uuid",
    "roles": ["user"],
    "permissions": ["read"],
    "type": "access",
    "iat": 1704067200,
    "exp": 1704068100
  },
  "user": {
    "id": "user-uuid",
    "email": "user@example.com"
  }
}
```

#### Extract JWT Claims

```http
GET /api/auth/claims
Authorization: Bearer <access_token>
```

**Response (200)**
```json
{
  "userId": "user-uuid",
  "email": "user@example.com",
  "sessionId": "session-uuid",
  "roles": ["user"],
  "permissions": ["read"],
  "metadata": {},
  "issuedAt": "2024-01-01T00:00:00.000Z",
  "expiresAt": "2024-01-01T00:15:00.000Z",
  "issuer": "authn-service",
  "audience": "authn-api",
  "tokenId": "jti-uuid"
}
```

#### Get Current User

```http
GET /api/auth/me
Authorization: Bearer <access_token>
```

**Response (200)**
```json
{
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### Info Endpoints

#### List Auth Methods

```http
GET /api/auth/methods
```

**Response (200)**
```json
{
  "methods": [
    {
      "type": "email_password",
      "endpoint": "/api/auth/login"
    },
    {
      "type": "oauth",
      "providers": ["google", "github", "apple"],
      "endpoints": {
        "url": "/api/auth/oauth/url",
        "callback": "/api/auth/oauth/callback"
      }
    }
  ]
}
```

#### Health Check

```http
GET /api/health
```

**Response (200)**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### Error Responses

All errors follow this format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

| HTTP Status | Code | Description |
|-------------|------|-------------|
| 400 | VALIDATION_ERROR | Invalid input data |
| 401 | UNAUTHORIZED | Missing or invalid token |
| 401 | INVALID_CREDENTIALS | Wrong email/password |
| 401 | INVALID_TOKEN | Token expired or invalid |
| 404 | USER_NOT_FOUND | User doesn't exist |
| 409 | USER_EXISTS | Email already registered |

## Project Structure

```
authN/
├── index.ts                    # Entry point
├── src/
│   ├── core/                   # Business logic (framework-agnostic)
│   │   ├── domain/             # Entities, value objects, types
│   │   ├── ports/              # Interfaces (inbound & outbound)
│   │   └── services/           # Business logic implementation
│   └── adapters/               # Framework-specific implementations
│       ├── inbound/            # HTTP routes
│       └── outbound/           # Database, cache, providers
├── package.json
└── README.md
```

See individual README files in each directory for detailed documentation.

## License

MIT
