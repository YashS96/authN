import type { Session } from "../../domain/entities/Session";

/**
 * Inbound port for session management use cases.
 */
export interface ISessionUseCase {
  // Session creation
  createSession(params: {
    userId: string;
    email: string;
    roles?: string[];
    permissions?: string[];
    metadata?: Record<string, unknown>;
  }): Promise<Session>;

  // Session retrieval
  getSessionById(id: string): Promise<Session | null>;
  getSessionByAccessToken(token: string): Promise<Session | null>;
  getSessionByRefreshToken(token: string): Promise<Session | null>;
  getSessionsByUserId(userId: string): Promise<Session[]>;

  // Session validation
  isSessionValid(session: Session): boolean;
  isAccessTokenValid(session: Session): boolean;
  isRefreshTokenValid(session: Session): boolean;

  // Session management
  refreshSession(session: Session): Promise<Session>;
  invalidateSession(sessionId: string): Promise<void>;
  invalidateAllUserSessions(userId: string): Promise<void>;
  cleanupExpiredSessions(): Promise<void>;
}
