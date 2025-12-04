import { Router } from "./router";
import { createAuthRoutes, createHealthRoutes } from "./routes";
import {
  corsMiddleware,
  loggingMiddleware,
  requestIdMiddleware,
  errorHandlerMiddleware,
  rateLimitMiddleware,
} from "./middlewares";
import type { IAuthUseCase } from "../../../core/ports";

export interface AppConfig {
  cors?: {
    origins?: string[] | "*";
    credentials?: boolean;
  };
  rateLimit?: {
    windowMs?: number;
    maxRequests?: number;
  };
  logging?: {
    logRequests?: boolean;
    logResponses?: boolean;
  };
}

export function createApp(authService: IAuthUseCase, config: AppConfig = {}): Router {
  const app = new Router();

  // Global middlewares (order matters!)
  app
    .use(requestIdMiddleware())
    .use(errorHandlerMiddleware())
    .use(corsMiddleware(config.cors))
    .use(loggingMiddleware(config.logging))
    .use(rateLimitMiddleware(config.rateLimit));

  // Mount routes
  app.merge(createHealthRoutes());
  app.merge(createAuthRoutes(authService));

  return app;
}

// Export for backwards compatibility
export { Router, createRouter } from "./router";
export * from "./middlewares";
export * from "./routes";
