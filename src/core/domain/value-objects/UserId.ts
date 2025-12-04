// UserId value object interface and schema

export interface IUserId {
  readonly value: string;
}

export const UserIdSchema = {
  UUID_REGEX: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,

  validate(id: string): { valid: boolean; error?: string } {
    if (typeof id !== "string" || !id.trim()) {
      return { valid: false, error: "UserId cannot be empty" };
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

export class UserId implements IUserId {
  private constructor(public readonly value: string) {}

  static create(id: string): UserId {
    const result = UserIdSchema.validate(id);
    if (!result.valid) throw new Error(result.error);
    return new UserId(id);
  }

  static generate(): UserId {
    return new UserId(UserIdSchema.generate());
  }

  equals(other: UserId): boolean {
    return this.value === other.value;
  }
}
