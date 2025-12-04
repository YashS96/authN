import type { Middleware, RequestContext } from "./types";
import { json } from "./types";
import type { IAuthUseCase } from "../../../../core/ports";
import {
  AuthenticationRequiredError,
  InvalidTokenError,
  InsufficientRoleError,
  InsufficientPermissionsError,
} from "../../../../utils/errors";

// Extract bearer token from request
export function extractBearerToken(req: Request): string | null {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.slice(7);
}

// Extract API key from request
export function extractApiKey(req: Request): string | null {
  // Check X-API-Key header
  const apiKey = req.headers.get("X-API-Key");
  if (apiKey) return apiKey;

  // Check Authorization header with ApiKey scheme
  const authHeader = req.headers.get("Authorization");
  if (authHeader?.startsWith("ApiKey ")) {
    return authHeader.slice(7);
  }

  return null;
}

// Authentication middleware - validates JWT token
export function authMiddleware(authService: IAuthUseCase): Middleware {
  return async (req: Request, ctx: RequestContext, next: () => Promise<Response>) => {
    const token = extractBearerToken(req);

    if (!token) {
      const error = new AuthenticationRequiredError();
      return json(error.toJSON(), error.statusCode);
    }

    const claims = await authService.extractClaims(token);

    if (!claims) {
      const error = new InvalidTokenError();
      return json(error.toJSON(), error.statusCode);
    }

    // Add user info to context
    ctx.user = {
      id: claims.sub,
      email: claims.email,
      claims,
    };

    return next();
  };
}

// Optional auth middleware - doesn't fail if no token
export function optionalAuthMiddleware(authService: IAuthUseCase): Middleware {
  return async (req: Request, ctx: RequestContext, next: () => Promise<Response>) => {
    const token = extractBearerToken(req);

    if (token) {
      const claims = await authService.extractClaims(token);
      if (claims) {
        ctx.user = {
          id: claims.sub,
          email: claims.email,
          claims,
        };
      }
    }

    return next();
  };
}

// Role-based authorization middleware
export function requireRoles(...roles: string[]): Middleware {
  return async (req: Request, ctx: RequestContext, next: () => Promise<Response>) => {
    if (!ctx.user) {
      const error = new AuthenticationRequiredError();
      return json(error.toJSON(), error.statusCode);
    }

    const userRoles = ctx.user.claims.roles ?? [];
    const hasRole = roles.some(role => userRoles.includes(role));

    if (!hasRole) {
      const error = new InsufficientRoleError(roles);
      return json(error.toJSON(), error.statusCode);
    }

    return next();
  };
}

// Permission-based authorization middleware
export function requirePermissions(...permissions: string[]): Middleware {
  return async (req: Request, ctx: RequestContext, next: () => Promise<Response>) => {
    if (!ctx.user) {
      const error = new AuthenticationRequiredError();
      return json(error.toJSON(), error.statusCode);
    }

    const userPermissions = ctx.user.claims.permissions ?? [];
    const hasPermission = permissions.every(perm => userPermissions.includes(perm));

    if (!hasPermission) {
      const error = new InsufficientPermissionsError(permissions);
      return json(error.toJSON(), error.statusCode);
    }

    return next();
  };
}
