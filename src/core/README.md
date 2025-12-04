# Core

The core layer contains all business logic and is **completely framework-agnostic**. It has no dependencies on external frameworks, databases, or HTTP servers.

## Structure

```
core/
├── domain/       # Entities, value objects, types, schemas
├── ports/        # Interfaces (contracts)
└── services/     # Business logic implementation
```

## Principles

### 1. Dependency Rule

Dependencies only point **inward**:
- `services/` depends on `domain/` and `ports/`
- `domain/` has no dependencies
- Nothing in core depends on adapters

### 2. Framework Independence

The core layer:
- Uses no external HTTP frameworks
- Has no database-specific code
- Contains pure TypeScript/JavaScript

### 3. Testability

All business logic can be tested with:
- Mock implementations of ports
- No need for real databases or servers
- Pure unit tests

## Layers

### Domain (`domain/`)

Contains the heart of the business:
- **Entities**: User, Session
- **Value Objects**: Email, Password, UserId, etc.
- **Types**: Shared type definitions
- **Schemas**: Validation rules

### Ports (`ports/`)

Defines contracts (interfaces):
- **Inbound**: What the application can do (use cases)
- **Outbound**: What the application needs (repositories, providers)

### Services (`services/`)

Implements business logic:
- **AuthService**: Authentication orchestration
- **TokenService**: JWT operations
- **SessionService**: Session management

## Usage

```typescript
import { AuthService, TokenService, SessionService } from "./services";
import type { IUserRepository, ISessionRepository } from "./ports";

// Services depend on interfaces, not concrete implementations
const authService = new AuthService(
  userRepository,    // implements IUserRepository
  sessionService,    // implements ISessionUseCase
  tokenService,      // implements ITokenUseCase
  providerRegistry   // implements IAuthProviderRegistry
);
```

