// Email value object interface and schema

export interface IEmail {
  readonly value: string;
}

export const EmailSchema = {
  REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  MAX_LENGTH: 255,

  validate(email: string): { valid: boolean; error?: string } {
    if (typeof email !== "string") {
      return { valid: false, error: "Email must be a string" };
    }

    const normalized = email.toLowerCase().trim();

    if (!this.REGEX.test(normalized)) {
      return { valid: false, error: "Invalid email format" };
    }

    if (normalized.length > this.MAX_LENGTH) {
      return { valid: false, error: `Email must be less than ${this.MAX_LENGTH} characters` };
    }

    return { valid: true };
  },

  normalize(email: string): string {
    return email.toLowerCase().trim();
  },
};

// Simple implementation for domain use
export class Email implements IEmail {
  private constructor(public readonly value: string) {}

  static create(email: string): Email {
    const result = EmailSchema.validate(email);
    if (!result.valid) throw new Error(result.error);
    return new Email(EmailSchema.normalize(email));
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}
