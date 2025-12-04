import type { Middleware, RequestContext } from "./types";
import { json } from "./types";
import {
  AppError,
  isAppError,
  InvalidJsonError,
  InternalServerError,
} from "../../../../utils/errors";

export interface ErrorHandlerOptions {
  includeStack: boolean;
  logErrors: boolean;
}

const DEFAULT_ERROR_OPTIONS: ErrorHandlerOptions = {
  includeStack: process.env.NODE_ENV !== "production",
  logErrors: true,
};

export function errorHandlerMiddleware(options: Partial<ErrorHandlerOptions> = {}): Middleware {
  const config = { ...DEFAULT_ERROR_OPTIONS, ...options };

  return async (req: Request, ctx: RequestContext, next: () => Promise<Response>) => {
    try {
      return await next();
    } catch (err) {
      if (config.logErrors) {
        console.error(`[${ctx.requestId}] Error:`, err);
      }

      // Handle AppError (our custom errors)
      if (isAppError(err)) {
        const response: Record<string, unknown> = {
          error: err.message,
          code: err.code,
          requestId: ctx.requestId,
          timestamp: err.timestamp.toISOString(),
        };

        if (err.details) {
          response.details = err.details;
        }

        if (config.includeStack) {
          response.stack = err.stack;
        }

        return json(response, err.statusCode);
      }

      // Handle JSON parse errors
      if (err instanceof SyntaxError && "body" in err) {
        const jsonError = new InvalidJsonError();
        return json(
          {
            error: jsonError.message,
            code: jsonError.code,
            requestId: ctx.requestId,
          },
          jsonError.statusCode
        );
      }

      // Handle unknown errors
      const internalError = new InternalServerError();
      const response: Record<string, unknown> = {
        error: internalError.message,
        code: internalError.code,
        requestId: ctx.requestId,
      };

      if (config.includeStack && err instanceof Error) {
        response.message = err.message;
        response.stack = err.stack;
      }

      return json(response, internalError.statusCode);
    }
  };
}
