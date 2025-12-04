import { SessionId } from "../value-objects/SessionId";
import { UserId } from "../value-objects/UserId";
import type { SessionJSON } from "../types";

export interface SessionProps {
  id: SessionId;
  userId: UserId;
  email: string;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: Date;
  refreshTokenExpiresAt: Date;
  roles: string[];
  permissions: string[];
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export interface CreateSessionData {
  id: string;
  userId: string;
  email: string;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: Date;
  refreshTokenExpiresAt: Date;
  roles: string[];
  permissions: string[];
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export class Session {
  private constructor(private readonly props: SessionProps) {}

  static fromData(data: CreateSessionData): Session {
    return new Session({
      id: SessionId.create(data.id),
      userId: UserId.create(data.userId),
      email: data.email,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      accessTokenExpiresAt: data.accessTokenExpiresAt,
      refreshTokenExpiresAt: data.refreshTokenExpiresAt,
      roles: data.roles,
      permissions: data.permissions,
      metadata: data.metadata,
      createdAt: data.createdAt,
    });
  }

  get id(): string {
    return this.props.id.value;
  }

  get userId(): string {
    return this.props.userId.value;
  }

  get email(): string {
    return this.props.email;
  }

  get accessToken(): string {
    return this.props.accessToken;
  }

  get refreshToken(): string {
    return this.props.refreshToken;
  }

  get accessTokenExpiresAt(): Date {
    return this.props.accessTokenExpiresAt;
  }

  get refreshTokenExpiresAt(): Date {
    return this.props.refreshTokenExpiresAt;
  }

  get roles(): string[] {
    return this.props.roles;
  }

  get permissions(): string[] {
    return this.props.permissions;
  }

  get metadata(): Record<string, unknown> {
    return this.props.metadata;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get expiresAt(): Date {
    return this.props.refreshTokenExpiresAt;
  }

  isAccessTokenExpired(): boolean {
    return new Date() > this.props.accessTokenExpiresAt;
  }

  isRefreshTokenExpired(): boolean {
    return new Date() > this.props.refreshTokenExpiresAt;
  }

  isExpired(): boolean {
    return this.isRefreshTokenExpired();
  }

  toJSON(): SessionJSON {
    return {
      id: this.id,
      userId: this.userId,
      accessToken: this.accessToken,
      accessTokenExpiresAt: this.accessTokenExpiresAt.toISOString(),
      refreshToken: this.refreshToken,
      refreshTokenExpiresAt: this.refreshTokenExpiresAt.toISOString(),
      createdAt: this.createdAt.toISOString(),
    };
  }

  toStorageData() {
    return {
      id: this.id,
      userId: this.userId,
      email: this.email,
      accessToken: this.accessToken,
      refreshToken: this.refreshToken,
      accessTokenExpiresAt: this.accessTokenExpiresAt.toISOString(),
      refreshTokenExpiresAt: this.refreshTokenExpiresAt.toISOString(),
      roles: this.roles,
      permissions: this.permissions,
      metadata: this.metadata,
      createdAt: this.createdAt.toISOString(),
    };
  }
}
