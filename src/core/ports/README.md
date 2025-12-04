# Ports

Ports define the **interfaces** (contracts) between the core domain and the outside world. They contain **no implementation** - only TypeScript interfaces.

## Structure

```
ports/
├── inbound/            # Use case interfaces (what the app CAN do)
│   ├── AuthUseCase.ts
│   ├── TokenUseCase.ts
│   └── SessionUseCase.ts
└── outbound/           # Dependency interfaces (what the app NEEDS)
    ├── UserRepository.ts
    ├── SessionRepository.ts
    ├── AuthProvider.ts
    ├── TokenStore.ts
    └── EmailService.ts
```

## Inbound Ports (Use Cases)

Define what operations the application exposes.

### IAuthUseCase

Main authentication operations:

```typescript
interface IAuthUseCase {
  // Registration
  register(dto: RegisterDTO): Promise<AuthResult>;

  // Login
  login(dto: LoginDTO): Promise<AuthResult>;
  loginWithEmailPassword(email: string, password: string): Promise<AuthResult>;
  loginWithOAuth(provider: OAuthProvider, code: string, redirectUri: string): Promise<AuthResult>;

  // OAuth
  getOAuthUrl(provider: OAuthProvider, redirectUri: string): Promise<OAuthUrlResult>;

  // Session
  logout(accessToken: string): Promise<void>;
  logoutAll(userId: string): Promise<void>;
  refreshToken(refreshToken: string): Promise<AuthResult>;

  // Token
  validateAccessToken(accessToken: string): Promise<TokenValidationResult>;
  extractClaims(accessToken: string): Promise<JWTClaims | null>;

  // User
  getMe(accessToken: string): Promise<User | null>;
}
```

### ITokenUseCase

JWT token operations:

```typescript
interface ITokenUseCase {
  signAccessToken(payload: {...}): Promise<string>;
  signRefreshToken(payload: {...}): Promise<string>;
  verifyAccessToken(token: string): Promise<JWTClaims | null>;
  verifyRefreshToken(token: string): Promise<JWTClaims | null>;
  decode(token: string): Promise<JWTClaims | null>;
  isExpired(token: string): Promise<boolean>;
  getConfig(): JWTConfig;
}
```

### ISessionUseCase

Session management:

```typescript
interface ISessionUseCase {
  createSession(params: {...}): Promise<Session>;
  getSessionById(id: string): Promise<Session | null>;
  getSessionsByUserId(userId: string): Promise<Session[]>;
  isSessionValid(session: Session): boolean;
  refreshSession(session: Session): Promise<Session>;
  invalidateSession(sessionId: string): Promise<void>;
  invalidateAllUserSessions(userId: string): Promise<void>;
}
```

## Outbound Ports (Dependencies)

Define what external services the application needs.

### IUserRepository

User persistence:

```typescript
interface IUserRepository {
  save(user: User): Promise<void>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  delete(id: string): Promise<void>;
  exists(email: string): Promise<boolean>;
  update(user: User): Promise<void>;
}
```

### ISessionRepository

Session persistence:

```typescript
interface ISessionRepository {
  save(session: Session): Promise<void>;
  findById(id: string): Promise<Session | null>;
  findByUserId(userId: string): Promise<Session[]>;
  delete(id: string): Promise<void>;
  deleteByUserId(userId: string): Promise<void>;
  deleteExpired(): Promise<void>;
}
```

### IAuthProvider

Authentication providers:

```typescript
// Base provider
interface IAuthProvider {
  readonly method: AuthMethod;
  authenticate(credentials: unknown): Promise<AuthenticatedUser>;
}

// Email/Password
interface IEmailPasswordProvider extends IAuthProvider {
  readonly method: "email_password";
  authenticate(credentials: { email, password }): Promise<AuthenticatedUser>;
}

// OAuth
interface IOAuthProvider extends IAuthProvider {
  readonly method: "google" | "github" | "apple";
  getAuthorizationUrl(params: {...}): string;
  exchangeCode(credentials: OAuthCredentials): Promise<OAuthTokens>;
  getUserInfo(accessToken: string): Promise<OAuthUserInfo>;
}

// API Key
interface IApiKeyProvider extends IAuthProvider {
  readonly method: "api_key";
  generateApiKey(userId: string, name: string): Promise<string>;
  revokeApiKey(apiKey: string): Promise<void>;
}

// Registry
interface IAuthProviderRegistry {
  register(provider: IAuthProvider): void;
  get(method: AuthMethod): IAuthProvider | undefined;
  has(method: AuthMethod): boolean;
  list(): AuthMethod[];
}
```

### ITokenStore

Token blacklist and OAuth state:

```typescript
interface ITokenStore {
  blacklist(tokenId: string, expiresAt: Date): Promise<void>;
  isBlacklisted(tokenId: string): Promise<boolean>;
  saveOAuthState(state: string, data: {...}, ttl: number): Promise<void>;
  getOAuthState(state: string): Promise<{...} | null>;
}
```

### IEmailService

Email notifications:

```typescript
interface IEmailService {
  sendWelcomeEmail(to: string, name?: string): Promise<void>;
  sendPasswordResetEmail(to: string, link: string): Promise<void>;
  sendEmailVerificationEmail(to: string, link: string): Promise<void>;
}
```

## Usage

Services implement inbound ports and depend on outbound ports:

```typescript
// AuthService implements IAuthUseCase
class AuthService implements IAuthUseCase {
  constructor(
    private userRepository: IUserRepository,      // outbound
    private sessionService: ISessionUseCase,      // inbound (other service)
    private tokenService: ITokenUseCase,          // inbound (other service)
    private providerRegistry: IAuthProviderRegistry // outbound
  ) {}
}
```

Adapters implement outbound ports:

```typescript
// PostgresUserRepository implements IUserRepository
class PostgresUserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    // PostgreSQL-specific implementation
  }
}
```

