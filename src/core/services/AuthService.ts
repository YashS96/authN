import type { User } from "../domain/entities/User";
import type { IAuthUseCase } from "../ports/AuthUseCase";
import type { IUserRepository } from "../ports/UserRepository";
import type { IAuthProviderRegistry, IOAuthProvider } from "../ports/AuthProvider";
import type { SessionService } from "./SessionService";
import type { TokenService } from "./TokenService";
import type {
  AuthResult,
  TokenValidationResult,
  OAuthUrlResult,
  RegisterDTO,
  LoginDTO,
  JWTClaims,
  OAuthProvider,
  AuthenticatedUser,
  AuthMethod,
} from "../domain/types";
import {
  UserAlreadyExistsError,
  InvalidCredentialsError,
  InvalidTokenError,
  SessionNotFoundError,
  UserNotFoundError,
  BadRequestError,
  OAuthProviderError,
} from "../../utils/errors";
import { createUser, userToJSON, sessionToJSON } from "./mappers";

interface OAuthStateData {
  provider: string;
  redirectUri: string;
  timestamp: number;
}

export class AuthService implements IAuthUseCase {
  private readonly oauthStates = new Map<string, OAuthStateData>();

  constructor(
    private readonly userRepository: IUserRepository,
    private readonly sessionService: SessionService,
    private readonly tokenService: TokenService,
    private readonly providerRegistry: IAuthProviderRegistry
  ) {}

  // ==================== REGISTRATION ====================

  async register(dto: RegisterDTO): Promise<AuthResult> {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new UserAlreadyExistsError(dto.email);
    }

    const user = await createUser({
      email: dto.email,
      plainPassword: dto.password,
    });

    await this.userRepository.save(user);

    const session = await this.sessionService.createSession({
      userId: user.id,
      email: user.email,
      roles: dto.roles,
      permissions: dto.permissions,
      metadata: dto.metadata,
    });

    return {
      user: userToJSON(user),
      session: sessionToJSON(session),
    };
  }

  // ==================== LOGIN METHODS ====================

  async login(dto: LoginDTO): Promise<AuthResult> {
    const provider = this.providerRegistry.get(dto.method);
    if (!provider) {
      throw new BadRequestError(`Authentication method '${dto.method}' is not supported`);
    }

    try {
      const authenticatedUser = await provider.authenticate(dto.credentials);
      return this.createOrUpdateUserSession(authenticatedUser);
    } catch (err) {
      if (err instanceof Error && err.message.includes("Invalid")) {
        throw new InvalidCredentialsError();
      }
      throw err;
    }
  }

  async loginWithEmailPassword(email: string, password: string): Promise<AuthResult> {
    return this.login({
      method: "email_password",
      credentials: { email, password },
    });
  }

  async loginWithOAuth(
    provider: OAuthProvider,
    code: string,
    redirectUri: string
  ): Promise<AuthResult> {
    return this.login({
      method: provider,
      credentials: { code, redirectUri },
    });
  }

  // ==================== OAUTH ====================

  async getOAuthUrl(provider: OAuthProvider, redirectUri: string): Promise<OAuthUrlResult> {
    const oauthProvider = this.providerRegistry.get(provider) as IOAuthProvider | undefined;
    if (!oauthProvider || !("getAuthorizationUrl" in oauthProvider)) {
      throw new OAuthProviderError(provider, "Provider not configured");
    }

    const state = crypto.randomUUID();

    this.oauthStates.set(state, {
      provider,
      redirectUri,
      timestamp: Date.now(),
    });

    this.cleanupOAuthStates();

    const url = oauthProvider.getAuthorizationUrl({
      redirectUri,
      state,
    });

    return { url, state };
  }

  private cleanupOAuthStates(): void {
    const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
    for (const [state, data] of this.oauthStates.entries()) {
      if (data.timestamp < tenMinutesAgo) {
        this.oauthStates.delete(state);
      }
    }
  }

  // ==================== SESSION MANAGEMENT ====================

  async logout(accessToken: string): Promise<void> {
    const claims = await this.tokenService.verifyAccessToken(accessToken);
    if (claims) {
      await this.sessionService.invalidateSession(claims.sessionId);
    }
  }

  async logoutAll(userId: string): Promise<void> {
    await this.sessionService.invalidateAllUserSessions(userId);
  }

  async refreshToken(refreshToken: string): Promise<AuthResult> {
    const claims = await this.tokenService.verifyRefreshToken(refreshToken);

    if (!claims) {
      throw new InvalidTokenError("Invalid or expired refresh token");
    }

    const session = await this.sessionService.getSessionById(claims.sessionId);

    if (!session) {
      throw new SessionNotFoundError();
    }

    const user = await this.userRepository.findById(claims.sub);
    if (!user) {
      await this.sessionService.invalidateSession(session.id);
      throw new UserNotFoundError();
    }

    const newSession = await this.sessionService.refreshSession(session);

    return {
      user: userToJSON(user),
      session: sessionToJSON(newSession),
    };
  }

  // ==================== TOKEN OPERATIONS ====================

  async validateAccessToken(accessToken: string): Promise<TokenValidationResult> {
    const claims = await this.tokenService.verifyAccessToken(accessToken);

    if (!claims) {
      return { valid: false };
    }

    const session = await this.sessionService.getSessionById(claims.sessionId);
    if (!session) {
      return { valid: false };
    }

    const user = await this.userRepository.findById(claims.sub);

    return {
      valid: true,
      claims,
      user: user ? userToJSON(user) : undefined,
    };
  }

  async extractClaims(accessToken: string): Promise<JWTClaims | null> {
    return this.tokenService.verifyAccessToken(accessToken);
  }

  // ==================== USER INFO ====================

  async getMe(accessToken: string): Promise<User | null> {
    const claims = await this.tokenService.verifyAccessToken(accessToken);

    if (!claims) {
      return null;
    }

    return this.userRepository.findById(claims.sub);
  }

  // ==================== HELPERS ====================

  private async createOrUpdateUserSession(
    authenticatedUser: AuthenticatedUser
  ): Promise<AuthResult> {
    let user: User;

    if (authenticatedUser.id) {
      const existingUser = await this.userRepository.findById(authenticatedUser.id);
      if (!existingUser) {
        throw new UserNotFoundError(authenticatedUser.id);
      }
      user = existingUser;
    } else {
      const existingUser = await this.userRepository.findByEmail(authenticatedUser.email);

      if (existingUser) {
        user = existingUser;
      } else {
        user = await createUser({
          email: authenticatedUser.email,
          plainPassword: crypto.randomUUID(),
        });
        await this.userRepository.save(user);
      }
    }

    // Delete existing sessions (single session policy)
    await this.sessionService.invalidateAllUserSessions(user.id);

    const session = await this.sessionService.createSession({
      userId: user.id,
      email: user.email,
      metadata: {
        provider: authenticatedUser.provider,
        providerUserId: authenticatedUser.providerUserId,
        name: authenticatedUser.name,
        picture: authenticatedUser.picture,
        ...authenticatedUser.metadata,
      },
    });

    return {
      user: userToJSON(user),
      session: sessionToJSON(session),
    };
  }

  // ==================== INFO ====================

  getSupportedMethods(): AuthMethod[] {
    return this.providerRegistry.list();
  }
}

// Re-export for backwards compatibility
export { AppError as AuthError } from "../../utils/errors";
