import type { Middleware, RequestContext } from "./types";
import { json } from "./types";
import { RateLimitExceededError } from "../../../../utils/errors";

export interface RateLimitOptions {
  windowMs: number;      // Time window in milliseconds
  maxRequests: number;   // Max requests per window
  keyGenerator: (req: Request) => string;
  skipPaths: string[];
  message: string;
}

const DEFAULT_RATE_LIMIT_OPTIONS: RateLimitOptions = {
  windowMs: 60 * 1000,   // 1 minute
  maxRequests: 100,      // 100 requests per minute
  keyGenerator: (req: Request) => {
    // Use IP address as default key
    const forwarded = req.headers.get("X-Forwarded-For");
    return forwarded?.split(",")[0]?.trim() ?? "unknown";
  },
  skipPaths: ["/api/health", "/api/ready"],
  message: "Too many requests, please try again later",
};

// In-memory store for rate limiting
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60 * 1000); // Cleanup every minute

export function rateLimitMiddleware(options: Partial<RateLimitOptions> = {}): Middleware {
  const config = { ...DEFAULT_RATE_LIMIT_OPTIONS, ...options };

  return async (req: Request, ctx: RequestContext, next: () => Promise<Response>) => {
    const url = new URL(req.url);
    const path = url.pathname;

    // Skip rate limiting for excluded paths
    if (config.skipPaths.includes(path)) {
      return next();
    }

    const key = config.keyGenerator(req);
    const now = Date.now();

    // Get or create rate limit entry
    let entry = rateLimitStore.get(key);
    
    if (!entry || entry.resetAt < now) {
      entry = {
        count: 0,
        resetAt: now + config.windowMs,
      };
      rateLimitStore.set(key, entry);
    }

    entry.count++;

    // Check if rate limit exceeded
    if (entry.count > config.maxRequests) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      const error = new RateLimitExceededError(config.maxRequests, retryAfter);
      
      const response = json(error.toJSON(), error.statusCode);
      const newHeaders = new Headers(response.headers);
      newHeaders.set("Retry-After", retryAfter.toString());
      
      return new Response(response.body, {
        status: response.status,
        headers: newHeaders,
      });
    }

    // Add rate limit headers to response
    const response = await next();
    const newHeaders = new Headers(response.headers);
    newHeaders.set("X-RateLimit-Limit", config.maxRequests.toString());
    newHeaders.set("X-RateLimit-Remaining", Math.max(0, config.maxRequests - entry.count).toString());
    newHeaders.set("X-RateLimit-Reset", Math.ceil(entry.resetAt / 1000).toString());

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  };
}

// Stricter rate limit for auth endpoints
export function authRateLimitMiddleware(): Middleware {
  return rateLimitMiddleware({
    windowMs: 15 * 60 * 1000,  // 15 minutes
    maxRequests: 10,           // 10 attempts per 15 minutes
    message: "Too many authentication attempts, please try again later",
  });
}
