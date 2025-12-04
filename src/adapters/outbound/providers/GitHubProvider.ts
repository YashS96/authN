import type { IOAuthProvider } from "../../../core/ports";
import type {
  OAuthCredentials,
  OAuthTokens,
  OAuthUserInfo,
  AuthenticatedUser,
  OAuthConfig,
} from "../../../core/domain/types";

export class GitHubAuthProvider implements IOAuthProvider {
  readonly method = "github" as const;

  private readonly authUrl = "https://github.com/login/oauth/authorize";
  private readonly tokenUrl = "https://github.com/login/oauth/access_token";
  private readonly userInfoUrl = "https://api.github.com/user";
  private readonly emailsUrl = "https://api.github.com/user/emails";

  constructor(private readonly config: OAuthConfig) {}

  getAuthorizationUrl(params: {
    redirectUri: string;
    state: string;
    scopes?: string[];
    codeChallenge?: string;
  }): string {
    const scopes = params.scopes ?? ["user:email", "read:user"];

    const searchParams = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: params.redirectUri,
      scope: scopes.join(" "),
      state: params.state,
    });

    return `${this.authUrl}?${searchParams.toString()}`;
  }

  async exchangeCode(credentials: OAuthCredentials): Promise<OAuthTokens> {
    const response = await fetch(this.tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        code: credentials.code,
        redirect_uri: credentials.redirectUri,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to exchange code: ${error}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(`GitHub OAuth error: ${data.error_description || data.error}`);
    }

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in ?? 0,
      tokenType: data.token_type,
      scope: data.scope,
    };
  }

  async getUserInfo(accessToken: string): Promise<OAuthUserInfo> {
    const userResponse = await fetch(this.userInfoUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
      },
    });

    if (!userResponse.ok) {
      throw new Error("Failed to get user info from GitHub");
    }

    const userData = await userResponse.json();

    let email = userData.email;
    let emailVerified = false;

    if (!email) {
      const emailsResponse = await fetch(this.emailsUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github+json",
        },
      });

      if (emailsResponse.ok) {
        const emails = await emailsResponse.json();
        const primaryEmail = emails.find(
          (e: { primary: boolean; verified: boolean; email: string }) =>
            e.primary && e.verified
        );

        if (primaryEmail) {
          email = primaryEmail.email;
          emailVerified = primaryEmail.verified;
        } else {
          const verifiedEmail = emails.find(
            (e: { verified: boolean; email: string }) => e.verified
          );
          if (verifiedEmail) {
            email = verifiedEmail.email;
            emailVerified = verifiedEmail.verified;
          }
        }
      }
    }

    if (!email) {
      throw new Error("Unable to get email from GitHub");
    }

    return {
      id: userData.id.toString(),
      email,
      emailVerified,
      name: userData.name || userData.login,
      picture: userData.avatar_url,
      raw: userData,
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
      metadata: { raw: userInfo.raw },
    };
  }
}
