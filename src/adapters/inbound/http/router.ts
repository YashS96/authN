import type { Middleware, RequestContext, Route, RouteHandler } from "./middlewares/types";
import { json } from "./middlewares/types";

export interface RouterConfig {
  basePath: string;
  globalMiddlewares: Middleware[];
}

export class Router {
  private routes: Map<string, Map<string, { handler: RouteHandler; middlewares: Middleware[] }>> = new Map();
  private globalMiddlewares: Middleware[] = [];
  private basePath: string;

  constructor(config: Partial<RouterConfig> = {}) {
    this.basePath = config.basePath ?? "";
    this.globalMiddlewares = config.globalMiddlewares ?? [];
  }

  // Add global middleware
  use(middleware: Middleware): this {
    this.globalMiddlewares.push(middleware);
    return this;
  }

  // Register a route
  route(
    method: string,
    path: string,
    handler: RouteHandler,
    middlewares: Middleware[] = []
  ): this {
    const fullPath = this.basePath + path;
    
    if (!this.routes.has(fullPath)) {
      this.routes.set(fullPath, new Map());
    }
    
    this.routes.get(fullPath)!.set(method.toUpperCase(), {
      handler,
      middlewares,
    });
    
    return this;
  }

  // Convenience methods
  get(path: string, handler: RouteHandler, middlewares?: Middleware[]): this {
    return this.route("GET", path, handler, middlewares);
  }

  post(path: string, handler: RouteHandler, middlewares?: Middleware[]): this {
    return this.route("POST", path, handler, middlewares);
  }

  put(path: string, handler: RouteHandler, middlewares?: Middleware[]): this {
    return this.route("PUT", path, handler, middlewares);
  }

  patch(path: string, handler: RouteHandler, middlewares?: Middleware[]): this {
    return this.route("PATCH", path, handler, middlewares);
  }

  delete(path: string, handler: RouteHandler, middlewares?: Middleware[]): this {
    return this.route("DELETE", path, handler, middlewares);
  }

  // Merge another router
  merge(router: Router): this {
    for (const [path, methods] of router.routes) {
      for (const [method, config] of methods) {
        this.route(method, path.replace(router.basePath, ""), config.handler, config.middlewares);
      }
    }
    return this;
  }

  // Create the fetch handler
  handler(): (req: Request) => Promise<Response> {
    return async (req: Request): Promise<Response> => {
      const url = new URL(req.url);
      const path = url.pathname;
      const method = req.method.toUpperCase();

      // Create request context
      const ctx: RequestContext = {
        requestId: crypto.randomUUID(),
        startTime: Date.now(),
        metadata: {},
      };

      // Find route
      const pathRoutes = this.routes.get(path);
      
      if (!pathRoutes) {
        return json({ error: "Not found", code: "NOT_FOUND" }, 404);
      }

      const routeConfig = pathRoutes.get(method);
      
      if (!routeConfig) {
        // Check if path exists but method not allowed
        return json({ error: "Method not allowed", code: "METHOD_NOT_ALLOWED" }, 405);
      }

      // Build middleware chain
      const allMiddlewares = [...this.globalMiddlewares, ...routeConfig.middlewares];
      
      // Execute middleware chain
      const { handler } = routeConfig;
      const executeChain = async (index: number): Promise<Response> => {
        const middleware = allMiddlewares[index];
        if (middleware) {
          return middleware(req, ctx, () => executeChain(index + 1));
        }
        
        // Execute handler
        return handler(req, ctx);
      };

      return executeChain(0);
    };
  }

  // Get all registered routes (for documentation)
  getRoutes(): Array<{ method: string; path: string }> {
    const routes: Array<{ method: string; path: string }> = [];
    
    for (const [path, methods] of this.routes) {
      for (const method of methods.keys()) {
        routes.push({ method, path });
      }
    }
    
    return routes.sort((a, b) => a.path.localeCompare(b.path));
  }
}

// Create a sub-router with a base path
export function createRouter(basePath = ""): Router {
  return new Router({ basePath });
}

