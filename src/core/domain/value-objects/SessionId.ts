// SessionId value object interface and schema

export interface ISessionId {
  readonly value: string;
}

export const SessionIdSchema = {
  UUID_REGEX: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,

  validate(id: string): { valid: boolean; error?: string } {
    if (typeof id !== "string" || !id.trim()) {
      return { valid: false, error: "SessionId cannot be empty" };
    }

    if (!this.UUID_REGEX.test(id)) {
      return { valid: false, error: "Invalid UUID format" };
    }

    return { valid: true };
  },

  generate(): string {
    return crypto.randomUUID();
  },
};

export class SessionId implements ISessionId {
  private constructor(public readonly value: string) {}

  static create(id: string): SessionId {
    const result = SessionIdSchema.validate(id);
    if (!result.valid) throw new Error(result.error);
    return new SessionId(id);
  }

  static generate(): SessionId {
    return new SessionId(SessionIdSchema.generate());
  }

  equals(other: SessionId): boolean {
    return this.value === other.value;
  }
}
