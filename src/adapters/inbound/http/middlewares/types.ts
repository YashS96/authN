import type { JWTClaims } from "../../../../core/domain/types";

// Extended request context
export interface RequestContext {
  requestId: string;
  startTime: number;
  user?: {
    id: string;
    email: string;
    claims: JWTClaims;
  };
  metadata: Record<string, unknown>;
}

// Middleware function type
export type Middleware = (
  req: Request,
  ctx: RequestContext,
  next: () => Promise<Response>
) => Promise<Response>;

// Route handler with context
export type RouteHandler = (req: Request, ctx: RequestContext) => Promise<Response> | Response;

// Route definition
export interface Route {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  handler: RouteHandler;
  middlewares?: Middleware[];
  auth?: boolean; // requires authentication
}

// Response helpers
export function json(data: unknown, status = 200, headers?: Record<string, string>): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
}

export function error(message: string, status = 400, code = "ERROR"): Response {
  return json({ error: message, code }, status);
}

export function success(data: unknown, status = 200): Response {
  return json(data, status);
}

