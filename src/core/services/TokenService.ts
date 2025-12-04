import jwt from "jsonwebtoken";
import type { ITokenUseCase } from "../ports/inbound/TokenUseCase";
import type { JWTClaims, JWTConfig } from "../domain/types";

const DEFAULT_CONFIG: JWTConfig = {
  secret: process.env.JWT_SECRET ?? "change-this-in-production",
  issuer: process.env.JWT_ISSUER ?? "authn-service",
  audience: process.env.JWT_AUDIENCE ?? "authn-api",
  accessTokenTTL: 15 * 60,           // 15 minutes
  refreshTokenTTL: 7 * 24 * 60 * 60, // 7 days
};

export class TokenService implements ITokenUseCase {
  private readonly config: JWTConfig;

  constructor(config?: Partial<JWTConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async signAccessToken(payload: {
    userId: string;
    email: string;
    sessionId: string;
    roles?: string[];
    permissions?: string[];
    metadata?: Record<string, unknown>;
  }): Promise<string> {
    const now = Math.floor(Date.now() / 1000);

    return jwt.sign(
      {
        email: payload.email,
        type: "access" as const,
        sessionId: payload.sessionId,
        roles: payload.roles ?? [],
        permissions: payload.permissions ?? [],
        metadata: payload.metadata ?? {},
        nbf: now,
      },
      this.config.secret,
      {
        algorithm: "HS256",
        subject: payload.userId,
        issuer: this.config.issuer,
        audience: this.config.audience,
        expiresIn: this.config.accessTokenTTL,
        jwtid: crypto.randomUUID(),
      }
    );
  }

  async signRefreshToken(payload: {
    userId: string;
    email: string;
    sessionId: string;
  }): Promise<string> {
    const now = Math.floor(Date.now() / 1000);

    return jwt.sign(
      {
        email: payload.email,
        type: "refresh" as const,
        sessionId: payload.sessionId,
        nbf: now,
      },
      this.config.secret,
      {
        algorithm: "HS256",
        subject: payload.userId,
        issuer: this.config.issuer,
        audience: this.config.audience,
        expiresIn: this.config.refreshTokenTTL,
        jwtid: crypto.randomUUID(),
      }
    );
  }

  async verifyAccessToken(token: string): Promise<JWTClaims | null> {
    try {
      const payload = jwt.verify(token, this.config.secret, {
        algorithms: ["HS256"],
        issuer: this.config.issuer,
        audience: this.config.audience,
      }) as jwt.JwtPayload;

      if (payload.type !== "access") {
        return null;
      }

      return this.mapPayloadToClaims(payload);
    } catch {
      return null;
    }
  }

  async verifyRefreshToken(token: string): Promise<JWTClaims | null> {
    try {
      const payload = jwt.verify(token, this.config.secret, {
        algorithms: ["HS256"],
        issuer: this.config.issuer,
        audience: this.config.audience,
      }) as jwt.JwtPayload;

      if (payload.type !== "refresh") {
        return null;
      }

      return this.mapPayloadToClaims(payload);
    } catch {
      return null;
    }
  }

  async decode(token: string): Promise<JWTClaims | null> {
    try {
      const payload = jwt.verify(token, this.config.secret, {
        algorithms: ["HS256"],
        issuer: this.config.issuer,
        audience: this.config.audience,
      }) as jwt.JwtPayload;

      return this.mapPayloadToClaims(payload);
    } catch {
      return null;
    }
  }

  async isExpired(token: string): Promise<boolean> {
    try {
      jwt.verify(token, this.config.secret);
      return false;
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        return true;
      }
      return true;
    }
  }

  getConfig(): JWTConfig {
    return { ...this.config };
  }

  get accessTokenTTLMs(): number {
    return this.config.accessTokenTTL * 1000;
  }

  get refreshTokenTTLMs(): number {
    return this.config.refreshTokenTTL * 1000;
  }

  private mapPayloadToClaims(payload: jwt.JwtPayload): JWTClaims {
    return {
      sub: payload.sub!,
      email: payload.email as string,
      sessionId: payload.sessionId as string,
      roles: (payload.roles as string[]) ?? [],
      permissions: (payload.permissions as string[]) ?? [],
      metadata: (payload.metadata as Record<string, unknown>) ?? {},
      type: payload.type as "access" | "refresh",
      iss: payload.iss!,
      aud: payload.aud as string,
      iat: payload.iat!,
      exp: payload.exp!,
      nbf: payload.nbf!,
      jti: payload.jti!,
    };
  }
}
