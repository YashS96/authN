// Email/Password credentials schema

import { EmailSchema } from "../Email";
import { PasswordSchema } from "../Password";

export interface IEmailPasswordCredentials {
  email: string;
  password: string;
}

export const EmailPasswordCredentialsSchema = {
  validate(input: unknown): { valid: boolean; data?: IEmailPasswordCredentials; error?: string } {
    if (!input || typeof input !== "object") {
      return { valid: false, error: "Invalid credentials object" };
    }

    const obj = input as Record<string, unknown>;

    const emailResult = EmailSchema.validate(obj.email as string);
    if (!emailResult.valid) {
      return { valid: false, error: emailResult.error };
    }

    const passwordResult = PasswordSchema.validate(obj.password as string);
    if (!passwordResult.valid) {
      return { valid: false, error: passwordResult.error };
    }

    return {
      valid: true,
      data: {
        email: EmailSchema.normalize(obj.email as string),
        password: obj.password as string,
      },
    };
  },
};
