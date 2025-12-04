// OAuth credentials schema

import type { OAuthProvider } from "../../types";

export interface IOAuthCredentials {
  provider: OAuthProvider;
  code: string;
  redirectUri: string;
  state: string;
  codeVerifier?: string;
}

export interface IOAuthState {
  value: string;
  provider: OAuthProvider;
  redirectUri: string;
  codeChallenge?: string;
  expiresAt: Date;
}

export const OAuthCredentialsSchema = {
  VALID_PROVIDERS: ["google", "github", "apple"] as const,

  validate(input: unknown): { valid: boolean; data?: IOAuthCredentials; error?: string } {
    if (!input || typeof input !== "object") {
      return { valid: false, error: "Invalid OAuth credentials object" };
    }

    const obj = input as Record<string, unknown>;

    if (!this.VALID_PROVIDERS.includes(obj.provider as OAuthProvider)) {
      return { valid: false, error: `Invalid OAuth provider. Must be one of: ${this.VALID_PROVIDERS.join(", ")}` };
    }

    if (typeof obj.code !== "string" || !obj.code.trim()) {
      return { valid: false, error: "OAuth code is required" };
    }

    if (typeof obj.redirectUri !== "string" || !obj.redirectUri.trim()) {
      return { valid: false, error: "Redirect URI is required" };
    }

    if (typeof obj.state !== "string" || !obj.state.trim()) {
      return { valid: false, error: "OAuth state is required" };
    }

    return {
      valid: true,
      data: {
        provider: obj.provider as OAuthProvider,
        code: obj.code as string,
        redirectUri: obj.redirectUri as string,
        state: obj.state as string,
        codeVerifier: obj.codeVerifier as string | undefined,
      },
    };
  },
};

export const OAuthStateSchema = {
  TTL_SECONDS: 600, // 10 minutes

  generate(provider: OAuthProvider, redirectUri: string, codeChallenge?: string): IOAuthState {
    return {
      value: crypto.randomUUID(),
      provider,
      redirectUri,
      codeChallenge,
      expiresAt: new Date(Date.now() + this.TTL_SECONDS * 1000),
    };
  },

  isExpired(state: IOAuthState): boolean {
    return new Date() > state.expiresAt;
  },
};

// PKCE helper schema
export const PKCESchema = {
  async generate(): Promise<{ verifier: string; challenge: string }> {
    const buffer = new Uint8Array(32);
    crypto.getRandomValues(buffer);
    const verifier = this.base64UrlEncode(buffer);

    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const challenge = this.base64UrlEncode(new Uint8Array(hashBuffer));

    return { verifier, challenge };
  },

  base64UrlEncode(buffer: Uint8Array): string {
    const base64 = btoa(String.fromCharCode(...buffer));
    return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  },
};
