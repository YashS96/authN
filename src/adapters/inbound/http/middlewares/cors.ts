import type { Middleware, RequestContext } from "./types";

export interface CorsOptions {
  origins: string[] | "*";
  methods: string[];
  headers: string[];
  credentials: boolean;
  maxAge: number;
}

const DEFAULT_CORS_OPTIONS: CorsOptions = {
  origins: "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  headers: ["Content-Type", "Authorization", "X-API-Key", "X-Request-ID"],
  credentials: true,
  maxAge: 86400, // 24 hours
};

export function corsMiddleware(options: Partial<CorsOptions> = {}): Middleware {
  const config = { ...DEFAULT_CORS_OPTIONS, ...options };

  return async (req: Request, ctx: RequestContext, next: () => Promise<Response>) => {
    const origin = req.headers.get("Origin") ?? "*";
    
    // Check if origin is allowed
    const allowedOrigin = config.origins === "*" 
      ? "*" 
      : config.origins.includes(origin) 
        ? origin 
        : null;

    // Handle preflight
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": allowedOrigin ?? "",
          "Access-Control-Allow-Methods": config.methods.join(", "),
          "Access-Control-Allow-Headers": config.headers.join(", "),
          "Access-Control-Allow-Credentials": config.credentials.toString(),
          "Access-Control-Max-Age": config.maxAge.toString(),
        },
      });
    }

    // Process request
    const response = await next();

    // Add CORS headers to response
    const newHeaders = new Headers(response.headers);
    if (allowedOrigin) {
      newHeaders.set("Access-Control-Allow-Origin", allowedOrigin);
      newHeaders.set("Access-Control-Allow-Credentials", config.credentials.toString());
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  };
}

