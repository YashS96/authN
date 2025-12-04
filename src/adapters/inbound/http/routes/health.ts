import { Router } from "../router";
import { json } from "../middlewares/types";

export function createHealthRoutes(): Router {
  const router = new Router({ basePath: "/api" });

  router.get("/health", async () => {
    return json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    }, 200);
  });

  router.get("/ready", async () => {
    // Add checks for dependencies (DB, Redis, etc.)
    return json({
      status: "ready",
      timestamp: new Date().toISOString(),
    }, 200);
  });

  return router;
}

