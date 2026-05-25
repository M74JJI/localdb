import Fastify from "fastify";
import cookie from "@fastify/cookie";
import helmet from "@fastify/helmet";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import { tryPrisma } from "@localdb-hub/db";
import { getDockerVersionSafe } from "@localdb-hub/docker";
import { tierOneTemplates } from "@localdb-hub/templates";
import { getMasterKeyStatus } from "@localdb-hub/security";
import { registerAuthRoutes, requireAuth } from "./modules/auth";
import { registerInstanceRoutes } from "./modules/instances";
import { registerJobRoutes } from "./modules/jobs";
import { registerInstanceActionRoutes } from "./modules/instance-actions";
import { registerBackupRoutes } from "./modules/backups";
import { registerAuditRoutes } from "./modules/audit";
import { registerSystemRoutes } from "./modules/system";

export async function buildApp() {
  const app = Fastify({
    logger: true
  });

  const webOrigin = process.env.LOCALDB_HUB_WEB_ORIGIN ?? "http://localhost:3000";

  await app.register(cookie);
  await app.register(helmet);
  await app.register(cors, {
    origin: [webOrigin],
    credentials: true
  });
  await app.register(rateLimit, {
    max: 120,
    timeWindow: "1 minute"
  });

  app.get("/health", async () => ({
    status: "ok",
    service: "localdb-hub-api"
  }));

  app.get("/api/templates", async (request, reply) => {
    const user = await requireAuth(request, reply);
    if (!user) return reply;

    return {
      templates: tierOneTemplates
    };
  });

  app.get("/api/system/health", async () => {
    const prismaState = await tryPrisma();

    let metadataDb = "not_initialized";

    if (prismaState.ok) {
      try {
        await prismaState.prisma.$queryRaw`SELECT 1`;
        metadataDb = "ok";
      } catch (error) {
        metadataDb = error instanceof Error ? `error: ${error.message}` : "error";
      }
    } else {
      metadataDb = prismaState.error;
    }

    const docker = await getDockerVersionSafe();
    const masterKey = getMasterKeyStatus();

    return {
      status: metadataDb === "ok" && masterKey.exists ? "ok" : "degraded",
      metadataDb,
      docker: docker.ok ? `ok:${docker.version}` : docker.skipped ? "skipped" : `unavailable:${docker.error}`,
      dockerMessage: docker.ok ? null : docker.error,
      masterKey: masterKey.exists ? "ok" : "missing",
      masterKeyPath: masterKey.path,
      templates: tierOneTemplates.length
    };
  });

  await registerAuthRoutes(app);
  await registerInstanceRoutes(app);
  await registerInstanceActionRoutes(app);
  await registerBackupRoutes(app);
  await registerJobRoutes(app);
  await registerAuditRoutes(app);
  await registerSystemRoutes(app);

  return app;
}
