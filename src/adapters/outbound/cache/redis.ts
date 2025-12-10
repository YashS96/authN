import { RedisClient } from "bun";
import type { Session, SessionStorageData } from "../../../core/domain/entities/Session";
import type { ISessionRepository } from "../../../core/ports/SessionRepository";

export class RedisSessionRepository implements ISessionRepository {
  private redis: RedisClient;
  private readonly PREFIX = "session:";
  private readonly USER_SESSIONS_PREFIX = "user_sessions:";

  constructor(url?: string) {
    this.redis = new RedisClient(url ?? process.env.REDIS_URL ?? "redis://localhost:6379");
  }

  private sessionKey(id: string): string {
    return `${this.PREFIX}${id}`;
  }

  private userSessionsKey(userId: string): string {
    return `${this.USER_SESSIONS_PREFIX}${userId}`;
  }

  async save(session: Session): Promise<void> {
    const storageData: SessionStorageData = {
      id: session.id,
      userId: session.userId,
      email: session.email,
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      accessTokenExpiresAt: session.accessTokenExpiresAt.toISOString(),
      refreshTokenExpiresAt: session.refreshTokenExpiresAt.toISOString(),
      roles: session.roles,
      permissions: session.permissions,
      metadata: session.metadata,
      createdAt: session.createdAt.toISOString(),
    };
    const data = JSON.stringify(storageData);
    const ttl = Math.ceil((session.refreshTokenExpiresAt.getTime() - Date.now()) / 1000);

    if (ttl <= 0) return;

    await this.redis.send("SETEX", [this.sessionKey(session.id), ttl.toString(), data]);
    await this.redis.send("SADD", [this.userSessionsKey(session.userId), session.id]);
    await this.redis.send("EXPIRE", [this.userSessionsKey(session.userId), ttl.toString()]);
  }

  async findById(id: string): Promise<Session | null> {
    const data = await this.redis.send("GET", [this.sessionKey(id)]);
    if (!data) return null;
    return this.parseSession(data as string);
  }

  async findByAccessToken(token: string): Promise<Session | null> {
    // For JWT, we decode the token to get sessionId
    // This is handled by the service layer
    return null;
  }

  async findByRefreshToken(token: string): Promise<Session | null> {
    // For JWT, we decode the token to get sessionId
    // This is handled by the service layer
    return null;
  }

  async findByUserId(userId: string): Promise<Session[]> {
    const sessionIds = await this.redis.send("SMEMBERS", [this.userSessionsKey(userId)]) as string[];

    if (!sessionIds || sessionIds.length === 0) return [];

    const sessions: Session[] = [];
    for (const id of sessionIds) {
      const session = await this.findById(id);
      if (session) sessions.push(session);
    }

    return sessions;
  }

  async delete(id: string): Promise<void> {
    const session = await this.findById(id);
    if (!session) return;

    await this.redis.send("DEL", [this.sessionKey(id)]);
    await this.redis.send("SREM", [this.userSessionsKey(session.userId), id]);
  }

  async deleteByUserId(userId: string): Promise<void> {
    const sessions = await this.findByUserId(userId);

    for (const session of sessions) {
      await this.redis.send("DEL", [this.sessionKey(session.id)]);
    }

    await this.redis.send("DEL", [this.userSessionsKey(userId)]);
  }

  async deleteExpired(): Promise<void> {
    // Redis handles expiration automatically via TTL
  }

  private parseSession(data: string): Session {
    const parsed = JSON.parse(data);
    return {
      id: parsed.id,
      userId: parsed.userId,
      email: parsed.email,
      accessToken: parsed.accessToken,
      refreshToken: parsed.refreshToken,
      accessTokenExpiresAt: new Date(parsed.accessTokenExpiresAt),
      refreshTokenExpiresAt: new Date(parsed.refreshTokenExpiresAt),
      roles: parsed.roles ?? [],
      permissions: parsed.permissions ?? [],
      metadata: parsed.metadata ?? {},
      createdAt: new Date(parsed.createdAt),
    };
  }

  async close(): Promise<void> {
    this.redis.close();
  }
}
