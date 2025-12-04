// API Key credentials schema

export interface IApiKey {
  hash: string;
  userId: string;
  name: string;
  scopes: string[];
  expiresAt: Date | null;
  createdAt: Date;
}

export interface IApiKeyCredentials {
  apiKey: string;
}

export const ApiKeySchema = {
  PREFIX: "ak_",
  KEY_LENGTH: 32,
  KEY_REGEX: /^ak_[a-f0-9]{64}$/,

  validate(key: string): { valid: boolean; error?: string } {
    if (typeof key !== "string") {
      return { valid: false, error: "API key must be a string" };
    }

    if (!key.startsWith(this.PREFIX)) {
      return { valid: false, error: `API key must start with '${this.PREFIX}'` };
    }

    if (!this.KEY_REGEX.test(key)) {
      return { valid: false, error: "Invalid API key format" };
    }

    return { valid: true };
  },

  generate(): string {
    const buffer = new Uint8Array(this.KEY_LENGTH);
    crypto.getRandomValues(buffer);
    const keyPart = Array.from(buffer)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return `${this.PREFIX}${keyPart}`;
  },

  async hash(key: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(key);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  },

  mask(key: string): string {
    return key.slice(0, 10) + "..." + key.slice(-4);
  },
};

export const ApiKeyCredentialsSchema = {
  validate(input: unknown): { valid: boolean; data?: IApiKeyCredentials; error?: string } {
    if (!input || typeof input !== "object") {
      return { valid: false, error: "Invalid API key credentials object" };
    }

    const obj = input as Record<string, unknown>;
    const keyResult = ApiKeySchema.validate(obj.apiKey as string);

    if (!keyResult.valid) {
      return { valid: false, error: keyResult.error };
    }

    return {
      valid: true,
      data: { apiKey: obj.apiKey as string },
    };
  },
};
