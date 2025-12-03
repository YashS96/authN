# AuthN — Centralized Authentication Service

A modular, extensible authentication service built with **Hexagonal Architecture** (Ports & Adapters). This service provides a unified interface for multiple authentication strategies, making it easy to integrate various auth mechanisms into your applications.

---

## 🏗️ Low level Architecture

This project follows the **Hexagonal Design Pattern**, separating core business logic from external concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                      ADAPTERS (Inbound)                     │
│            REST API • GraphQL • CLI • Message Queue         │
├─────────────────────────────────────────────────────────────┤
│                          PORTS                              │
│                  (Interfaces / Contracts)                   │
├─────────────────────────────────────────────────────────────┤
│                      CORE DOMAIN                            │
│         Authentication Logic • Token Management             │
│              Session Handling • User Identity               │
├─────────────────────────────────────────────────────────────┤
│                          PORTS                              │
│                  (Interfaces / Contracts)                   │
├─────────────────────────────────────────────────────────────┤
│                     ADAPTERS (Outbound)                     │
│      Database • Cache • OAuth Providers • SAML IdPs         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Supported Authentication Methods

### Standard Authentication

| Method | Description | Use Case |
|--------|-------------|----------|
| **Basic Auth** | `username:password` in HTTP headers (Base64 encoded) | Simple internal services, development |
| **Digest Auth** | Hashed credentials with nonce, more secure than Basic | Legacy systems requiring challenge-response |
| **Bearer Token** | Token in `Authorization` header (JWT, opaque tokens) | Modern APIs, microservices |
| **API Keys** | Static keys for service identification | Machine-to-machine communication, rate limiting |

### Federated Authentication

| Method | Description | Use Case |
|--------|-------------|----------|
| **OAuth 1.0** | Delegated authorization with signatures | Legacy integrations (Twitter API v1) |
| **OAuth 2.0** | Modern delegated authorization framework | Third-party app authorization |
| **OpenID Connect** | Identity layer on top of OAuth 2.0 | User authentication + identity claims |
| **SAML 2.0** | XML-based enterprise SSO | Enterprise SSO, B2B integrations |

---

## 🌐 SSO Providers

Integrated single sign-on support for popular identity providers:

- **Google** — OAuth 2.0 / OpenID Connect
- **Facebook** — OAuth 2.0
- **GitHub** — OAuth 2.0
- **Microsoft / Azure AD** — OAuth 2.0 / OpenID Connect / SAML
- **Apple** — Sign in with Apple (OAuth 2.0)
- **Twitter/X** — OAuth 1.0a / OAuth 2.0
- **LinkedIn** — OAuth 2.0
- **Okta** — SAML / OpenID Connect
- **Auth0** — SAML / OpenID Connect

---

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh) v1.3.3 or later

### Installation

```bash
bun install
```

### Running the Service

```bash
bun run index.ts
```

### Development Mode

```bash
bun --watch run index.ts
```

---

## 📁 Project Structure

```
authN/
├── src/
│   ├── core/                    # Domain logic (auth strategies, tokens)
│   │   ├── domain/              # Entities, value objects
│   │   ├── ports/               # Inbound & outbound interfaces
│   │   └── services/            # Application services
│   ├── adapters/
│   │   ├── inbound/             # HTTP controllers, GraphQL resolvers
│   │   └── outbound/            # Database, cache, provider clients
│   └── config/                  # Configuration management
├── index.ts                     # Application entry point
├── package.json
└── tsconfig.json
```

---

## 🛠️ Configuration

Environment variables for configuring providers and services:

```env
# Server
PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-secret-key
JWT_EXPIRY=3600

# OAuth Providers
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Database
DATABASE_URL=

# Redis (Sessions/Cache)
REDIS_URL=
```

---

## 📜 License

MIT

---

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.
