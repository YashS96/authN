// Password value object interface and schema
// Hashing implementation lives in PasswordService

export interface IPassword {
  readonly hash: string;
}

export interface PasswordRequirements {
  minLength: number;
  maxLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
}

export const PasswordSchema = {
  DEFAULT_REQUIREMENTS: {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false,
  } as PasswordRequirements,

  validate(password: string, requirements?: Partial<PasswordRequirements>): { valid: boolean; error?: string } {
    const config = { ...this.DEFAULT_REQUIREMENTS, ...requirements };

    if (typeof password !== "string") {
      return { valid: false, error: "Password must be a string" };
    }

    if (password.length < config.minLength) {
      return { valid: false, error: `Password must be at least ${config.minLength} characters` };
    }

    if (password.length > config.maxLength) {
      return { valid: false, error: `Password must be less than ${config.maxLength} characters` };
    }

    if (config.requireUppercase && !/[A-Z]/.test(password)) {
      return { valid: false, error: "Password must contain at least one uppercase letter" };
    }

    if (config.requireLowercase && !/[a-z]/.test(password)) {
      return { valid: false, error: "Password must contain at least one lowercase letter" };
    }

    if (config.requireNumbers && !/[0-9]/.test(password)) {
      return { valid: false, error: "Password must contain at least one number" };
    }

    if (config.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return { valid: false, error: "Password must contain at least one special character" };
    }

    return { valid: true };
  },
};

// Simple wrapper for domain use - hashing done in service
export class Password implements IPassword {
  private constructor(public readonly hash: string) {}

  static fromHash(hash: string): Password {
    return new Password(hash);
  }

  // Actual hashing should be done via PasswordService
  static async hash(plainPassword: string): Promise<Password> {
    const result = PasswordSchema.validate(plainPassword);
    if (!result.valid) throw new Error(result.error);

    const hash = await Bun.password.hash(plainPassword, {
      algorithm: "argon2id",
      memoryCost: 65536,
      timeCost: 3,
    });

    return new Password(hash);
  }

  async verify(plainPassword: string): Promise<boolean> {
    return Bun.password.verify(plainPassword, this.hash);
  }
}
