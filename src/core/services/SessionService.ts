import type { Session } from "../domain/entities/Session";
import type { ISessionUseCase } from "../ports/SessionUseCase";
import type { ISessionRepository } from "../ports/SessionRepository";
import type { TokenService } from "./TokenService";

export class SessionService implements ISessionUseCase {
  constructor(
    private readonly sessionRepository: ISessionRepository,
    private readonly tokenService: TokenService
  ) {}

  async createSession(params: {
    userId: string;
    email: string;
    roles?: string[];
    permissions?: string[];
    metadata?: Record<string, unknown>;
  }): Promise<Session> {
    const sessionId = crypto.randomUUID();
    const now = new Date();

    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.signAccessToken({
        userId: params.userId,
        email: params.email,
        sessionId,
        roles: params.roles,
        permissions: params.permissions,
        metadata: params.metadata,
      }),
      this.tokenService.signRefreshToken({
        userId: params.userId,
        email: params.email,
        sessionId,
      }),
    ]);

    const session: Session = {
      id: sessionId,
      userId: params.userId,
      email: params.email,
      accessToken,
      refreshToken,
      accessTokenExpiresAt: new Date(now.getTime() + this.tokenService.accessTokenTTLMs),
      refreshTokenExpiresAt: new Date(now.getTime() + this.tokenService.refreshTokenTTLMs),
      roles: params.roles ?? [],
      permissions: params.permissions ?? [],
      metadata: params.metadata ?? {},
      createdAt: now,
    };

    await this.sessionRepository.save(session);

    return session;
  }

  async getSessionById(id: string): Promise<Session | null> {
    return this.sessionRepository.findById(id);
  }

  async getSessionByAccessToken(token: string): Promise<Session | null> {
    const claims = await this.tokenService.verifyAccessToken(token);
    if (!claims) return null;
    return this.sessionRepository.findById(claims.sessionId);
  }

  async getSessionByRefreshToken(token: string): Promise<Session | null> {
    const claims = await this.tokenService.verifyRefreshToken(token);
    if (!claims) return null;
    return this.sessionRepository.findById(claims.sessionId);
  }

  async getSessionsByUserId(userId: string): Promise<Session[]> {
    return this.sessionRepository.findByUserId(userId);
  }

  isSessionValid(session: Session): boolean {
    return new Date() <= session.refreshTokenExpiresAt;
  }

  isAccessTokenValid(session: Session): boolean {
    return new Date() <= session.accessTokenExpiresAt;
  }

  isRefreshTokenValid(session: Session): boolean {
    return new Date() <= session.refreshTokenExpiresAt;
  }

  async refreshSession(session: Session): Promise<Session> {
    // Delete old session
    await this.sessionRepository.delete(session.id);

    // Create new session with fresh tokens
    return this.createSession({
      userId: session.userId,
      email: session.email,
      roles: session.roles,
      permissions: session.permissions,
      metadata: session.metadata,
    });
  }

  async invalidateSession(sessionId: string): Promise<void> {
    await this.sessionRepository.delete(sessionId);
  }

  async invalidateAllUserSessions(userId: string): Promise<void> {
    await this.sessionRepository.deleteByUserId(userId);
  }

  async cleanupExpiredSessions(): Promise<void> {
    await this.sessionRepository.deleteExpired();
  }
}

