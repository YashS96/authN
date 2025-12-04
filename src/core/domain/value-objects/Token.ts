// Token value object interface and schema

export interface IToken {
  readonly value: string;
  readonly expiresAt: Date;
}

export const TokenSchema = {
  MIN_LENGTH: 32,

  validate(token: string): { valid: boolean; error?: string } {
    if (typeof token !== "string") {
      return { valid: false, error: "Token must be a string" };
    }

    if (token.length < this.MIN_LENGTH) {
      return { valid: false, error: `Token must be at least ${this.MIN_LENGTH} characters` };
    }

    return { valid: true };
  },

  generateRandom(length: number = 32): string {
    const buffer = new Uint8Array(length);
    crypto.getRandomValues(buffer);
    return Array.from(buffer)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  },

  isExpired(expiresAt: Date): boolean {
    return new Date() > expiresAt;
  },
};

export class Token implements IToken {
  private constructor(
    public readonly value: string,
    public readonly expiresAt: Date
  ) {}

  static generate(expiresAt: Date): Token {
    return new Token(TokenSchema.generateRandom(), expiresAt);
  }

  static fromExisting(value: string, expiresAt: Date): Token {
    const result = TokenSchema.validate(value);
    if (!result.valid) throw new Error(result.error);
    return new Token(value, expiresAt);
  }

  isExpired(): boolean {
    return TokenSchema.isExpired(this.expiresAt);
  }

  equals(other: Token): boolean {
    return this.value === other.value;
  }
}
