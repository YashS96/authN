import type { Middleware, RequestContext } from "./types";

export interface LoggingOptions {
  logRequests: boolean;
  logResponses: boolean;
  logErrors: boolean;
  excludePaths: string[];
}

const DEFAULT_LOGGING_OPTIONS: LoggingOptions = {
  logRequests: true,
  logResponses: true,
  logErrors: true,
  excludePaths: ["/api/health"],
};

export function loggingMiddleware(options: Partial<LoggingOptions> = {}): Middleware {
  const config = { ...DEFAULT_LOGGING_OPTIONS, ...options };

  return async (req: Request, ctx: RequestContext, next: () => Promise<Response>) => {
    const url = new URL(req.url);
    const path = url.pathname;

    // Skip logging for excluded paths
    if (config.excludePaths.includes(path)) {
      return next();
    }

    // Log request
    if (config.logRequests) {
      console.log(
        `[${new Date().toISOString()}] ${ctx.requestId} --> ${req.method} ${path}`
      );
    }

    try {
      const response = await next();
      const duration = Date.now() - ctx.startTime;

      // Log response
      if (config.logResponses) {
        const statusEmoji = response.status < 400 ? "✓" : "✗";
        console.log(
          `[${new Date().toISOString()}] ${ctx.requestId} <-- ${statusEmoji} ${response.status} (${duration}ms)`
        );
      }

      return response;
    } catch (err) {
      const duration = Date.now() - ctx.startTime;

      // Log error
      if (config.logErrors) {
        console.error(
          `[${new Date().toISOString()}] ${ctx.requestId} <-- ✗ ERROR (${duration}ms):`,
          err
        );
      }

      throw err;
    }
  };
}

// Request ID middleware - adds unique ID to each request
export function requestIdMiddleware(): Middleware {
  return async (req: Request, ctx: RequestContext, next: () => Promise<Response>) => {
    // Use existing request ID or generate new one
    ctx.requestId = req.headers.get("X-Request-ID") ?? crypto.randomUUID();
    ctx.startTime = Date.now();

    const response = await next();

    // Add request ID to response
    const newHeaders = new Headers(response.headers);
    newHeaders.set("X-Request-ID", ctx.requestId);

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  };
}

