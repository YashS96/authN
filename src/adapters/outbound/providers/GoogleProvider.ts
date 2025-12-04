import type { IOAuthProvider } from "../../../core/ports";
import type {
  OAuthCredentials,
  OAuthTokens,
  OAuthUserInfo,
  AuthenticatedUser,
  OAuthConfig,
} from "../../../core/domain/types";

export class GoogleAuthProvider implements IOAuthProvider {
  readonly method = "google" as const;

  private readonly authUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  private readonly tokenUrl = "https://oauth2.googleapis.com/token";
  private readonly userInfoUrl = "https://www.googleapis.com/oauth2/v2/userinfo";

  constructor(private readonly config: OAuthConfig) {}

  getAuthorizationUrl(params: {
    redirectUri: string;
    state: string;
    scopes?: string[];
    codeChallenge?: string;
  }): string {
    const scopes = params.scopes ?? ["openid", "email", "profile"];

    const searchParams = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: params.redirectUri,
      response_type: "code",
      scope: scopes.join(" "),
      state: params.state,
      access_type: "offline",
      prompt: "consent",
    });

    if (params.codeChallenge) {
      searchParams.set("code_challenge", params.codeChallenge);
      searchParams.set("code_challenge_method", "S256");
    }

    return `${this.authUrl}?${searchParams.toString()}`;
  }

  async exchangeCode(credentials: OAuthCredentials): Promise<OAuthTokens> {
    const body = new URLSearchParams({
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      code: credentials.code,
      grant_type: "authorization_code",
      redirect_uri: credentials.redirectUri,
    });

    if (credentials.codeVerifier) {
      body.set("code_verifier", credentials.codeVerifier);
    }

    const response = await fetch(this.tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to exchange code: ${error}`);
    }

    const data = await response.json();

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      idToken: data.id_token,
      expiresIn: data.expires_in,
      tokenType: data.token_type,
      scope: data.scope,
    };
  }

  async getUserInfo(accessToken: string): Promise<OAuthUserInfo> {
    const response = await fetch(this.userInfoUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new Error("Failed to get user info from Google");
    }

    const data = await response.json();

    return {
      id: data.id,
      email: data.email,
      emailVerified: data.verified_email ?? false,
      name: data.name,
      picture: data.picture,
      raw: data,
    };
  }

  async authenticate(credentials: OAuthCredentials): Promise<AuthenticatedUser> {
    const tokens = await this.exchangeCode(credentials);
    const userInfo = await this.getUserInfo(tokens.accessToken);

    return {
      email: userInfo.email,
      emailVerified: userInfo.emailVerified,
      name: userInfo.name,
      picture: userInfo.picture,
      provider: this.method,
      providerUserId: userInfo.id,
      metadata: {
        raw: userInfo.raw,
        tokens: {
          refreshToken: tokens.refreshToken,
          idToken: tokens.idToken,
        },
      },
    };
  }
}
