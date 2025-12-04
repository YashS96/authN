import type { Session } from "../../domain/entities/Session";

/**
 * Outbound port for session persistence.
 */
export interface ISessionRepository {
  save(session: Session): Promise<void>;
  findById(id: string): Promise<Session | null>;
  findByAccessToken(token: string): Promise<Session | null>;
  findByRefreshToken(token: string): Promise<Session | null>;
  findByUserId(userId: string): Promise<Session[]>;
  delete(id: string): Promise<void>;
  deleteByUserId(userId: string): Promise<void>;
  deleteExpired(): Promise<void>;
}
