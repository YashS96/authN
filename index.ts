import { AuthService, TokenService, SessionService } from "./src/core/services";
import { PostgresUserRepository } from "./src/adapters/outbound/database/postgres";
import { RedisSessionRepository } from "./src/adapters/outbound/cache/redis";
import { createApp } from "./src/adapters/inbound/http/app";
import {
  ProviderRegistry,
  EmailPasswordAuthProvider,
  GoogleAuthProvider,
  GitHubAuthProvider,
} from "./src/adapters/outbound/providers";

// Configuration (Bun auto-loads .env)
const config = {
  port: parseInt(process.env.PORT ?? "3000", 10),
  databaseUrl: process.env.DATABASE_URL ?? "postgres://localhost:5432/authn",
  redisUrl: process.env.REDIS_URL ?? "redis://localhost:6379",

  jwt: {
    secret: process.env.JWT_SECRET ?? "change-this-in-production",
    issuer: process.env.JWT_ISSUER ?? "authn-service",
    audience: process.env.JWT_AUDIENCE ?? "authn-api",
    accessTokenTTL: parseInt(process.env.JWT_ACCESS_TTL ?? "900", 10),
    refreshTokenTTL: parseInt(process.env.JWT_REFRESH_TTL ?? "604800", 10),
  },

  google: {
    clientId: process.env.GOOGLE_CLIENT_ID ?? "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
  },

  github: {
    clientId: process.env.GITHUB_CLIENT_ID ?? "",
    clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
  },
};

async function main() {
  console.log("🚀 Starting AuthN service...\n");

  // Initialize repositories (outbound adapters)
  const userRepository = new PostgresUserRepository(config.databaseUrl);
  const sessionRepository = new RedisSessionRepository(config.redisUrl);

  // Initialize database
  console.log("📦 Initializing database...");
  await userRepository.initialize();

  // Initialize services (core business logic)
  const tokenService = new TokenService(config.jwt);
  const sessionService = new SessionService(sessionRepository, tokenService);

  // Setup auth providers
  const providerRegistry = new ProviderRegistry();
  providerRegistry.register(new EmailPasswordAuthProvider(userRepository));

  if (config.google.clientId && config.google.clientSecret) {
    providerRegistry.register(new GoogleAuthProvider(config.google));
    console.log("✅ Google OAuth enabled");
  }

  if (config.github.clientId && config.github.clientSecret) {
    providerRegistry.register(new GitHubAuthProvider(config.github));
    console.log("✅ GitHub OAuth enabled");
  }

  // Create main auth service
  const authService = new AuthService(
    userRepository,
    sessionService,
    tokenService,
    providerRegistry
  );

  // Create HTTP app with middlewares
  const app = createApp(authService, {
    cors: {
      origins: "*",
      credentials: true,
    },
    rateLimit: {
      windowMs: 60 * 1000,
      maxRequests: 100,
    },
    logging: {
      logRequests: true,
      logResponses: true,
    },
  });

  // Start server
  const server = Bun.serve({
    port: config.port,
    fetch: app.handler(),
  });

  // Print registered routes
  console.log("\n📚 Registered Routes:\n");
  const routes = app.getRoutes();
  routes.forEach(({ method, path }) => {
    const methodPadded = method.padEnd(6);
    console.log(`   ${methodPadded} ${path}`);
  });

  console.log(`\n✅ AuthN service running at http://localhost:${server.port}\n`);

  // Print middleware info
  console.log("🛡️  Active Middlewares:");
  console.log("   • Request ID");
  console.log("   • Error Handler");
  console.log("   • CORS");
  console.log("   • Logging");
  console.log("   • Rate Limiting (100 req/min)");
  console.log("   • Auth Rate Limiting (10 attempts/15min)");
  console.log("");

  // Graceful shutdown
  const shutdown = async () => {
    console.log("\n🛑 Shutting down...");
    await userRepository.close();
    await sessionRepository.close();
    server.stop();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((err) => {
  console.error("❌ Failed to start:", err);
  process.exit(1);
});
