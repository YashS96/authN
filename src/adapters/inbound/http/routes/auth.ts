import { Router } from "../router";
import type { IAuthUseCase } from "../../../../core/ports";
import { json, error } from "../middlewares/types";
import { authMiddleware, authRateLimitMiddleware } from "../middlewares";
import {
  EmailPasswordCredentialsSchema,
  OAuthCredentialsSchema,
  RegisterUserSchema,
  RefreshTokenSchema,
} from "../../../../core/domain/schemas";

export function createAuthRoutes(authService: IAuthUseCase): Router {
  const router = new Router({ basePath: "/api/auth" });

  // ==================== REGISTRATION ====================
  router.post("/register", async (req, ctx) => {
    const body = await req.json();
    const validated = RegisterUserSchema.validate(body);

    if (!validated.valid) {
      return error(validated.error!, 400, "VALIDATION_ERROR");
    }

    const result = await authService.register(validated.data!);
    return json(result, 201);
  }, [authRateLimitMiddleware()]);

  // ==================== LOGIN ====================
  router.post("/login", async (req, ctx) => {
    const body = await req.json();
    const validated = EmailPasswordCredentialsSchema.validate(body);

    if (!validated.valid) {
      return error(validated.error!, 400, "VALIDATION_ERROR");
    }

    const result = await authService.loginWithEmailPassword(
      validated.data!.email,
      validated.data!.password
    );

    return json(result, 200);
  }, [authRateLimitMiddleware()]);

  // ==================== OAUTH ====================
  router.get("/oauth/url", async (req, ctx) => {
    const url = new URL(req.url);
    const provider = url.searchParams.get("provider");
    const redirectUri = url.searchParams.get("redirect_uri");

    if (!provider || !["google", "github", "apple"].includes(provider)) {
      return error("Valid provider required (google, github, apple)", 400, "VALIDATION_ERROR");
    }

    if (!redirectUri) {
      return error("redirect_uri is required", 400, "VALIDATION_ERROR");
    }

    const result = await authService.getOAuthUrl(
      provider as "google" | "github" | "apple",
      redirectUri
    );

    return json(result, 200);
  });

  router.post("/oauth/callback", async (req, ctx) => {
    const body = await req.json();
    const validated = OAuthCredentialsSchema.validate(body);

    if (!validated.valid) {
      return error(validated.error!, 400, "VALIDATION_ERROR");
    }

    const result = await authService.loginWithOAuth(
      validated.data!.provider,
      validated.data!.code,
      validated.data!.redirectUri
    );

    return json(result, 200);
  });

  // ==================== SESSION ====================
  router.post("/logout", async (req, ctx) => {
    const token = req.headers.get("Authorization")?.slice(7) ?? "";
    await authService.logout(token);
    return json({ message: "Logged out successfully" }, 200);
  }, [authMiddleware(authService)]);

  router.post("/logout-all", async (req, ctx) => {
    await authService.logoutAll(ctx.user!.id);
    return json({ message: "Logged out from all sessions" }, 200);
  }, [authMiddleware(authService)]);

  router.post("/refresh", async (req, ctx) => {
    const body = await req.json();
    const validated = RefreshTokenSchema.validate(body);

    if (!validated.valid) {
      return error(validated.error!, 400, "VALIDATION_ERROR");
    }

    const result = await authService.refreshToken(validated.data!.refreshToken);
    return json(result, 200);
  });

  // ==================== TOKEN ====================
  router.post("/validate", async (req, ctx) => {
    const result = await authService.validateAccessToken(
      req.headers.get("Authorization")?.slice(7) ?? ""
    );
    return json(result, 200);
  });

  router.get("/claims", async (req, ctx) => {
    const claims = ctx.user!.claims;
    return json({
      userId: claims.sub,
      email: claims.email,
      sessionId: claims.sessionId,
      roles: claims.roles,
      permissions: claims.permissions,
      metadata: claims.metadata,
      issuedAt: new Date(claims.iat * 1000).toISOString(),
      expiresAt: new Date(claims.exp * 1000).toISOString(),
      issuer: claims.iss,
      audience: claims.aud,
      tokenId: claims.jti,
    }, 200);
  }, [authMiddleware(authService)]);

  // ==================== USER ====================
  router.get("/me", async (req, ctx) => {
    const user = await authService.getMe(
      req.headers.get("Authorization")?.slice(7) ?? ""
    );

    if (!user) {
      return error("Invalid or expired token", 401, "UNAUTHORIZED");
    }

    return json({ user: user.toJSON() }, 200);
  }, [authMiddleware(authService)]);

  // ==================== INFO ====================
  router.get("/methods", async () => {
    return json({
      methods: [
        { type: "email_password", endpoint: "/api/auth/login" },
        {
          type: "oauth",
          providers: ["google", "github", "apple"],
          endpoints: {
            url: "/api/auth/oauth/url",
            callback: "/api/auth/oauth/callback",
          },
        },
      ],
    }, 200);
  });

  return router;
}

