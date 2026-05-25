import { existsSync, statSync } from "node:fs";
import type { FastifyInstance } from "fastify";
import { runtimePaths, masterKeyPath } from "@localdb-hub/config";
import { tryPrisma } from "@localdb-hub/db";
import { getDockerVersionSafe } from "@localdb-hub/docker";
import { tierOneTemplates } from "@localdb-hub/templates";
import { requireAuth } from "./auth";

function pathStatus(path: string) {
  try {
    const exists = existsSync(path);
    const stat = exists ? statSync(path) : null;

    return {
      path,
      exists,
      type: stat?.isDirectory() ? "directory" : stat?.isFile() ? "file" : exists ? "other" : "missing"
    };
  } catch (error) {
    return {
      path,
      exists: false,
      type: "error",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

export async function registerSystemRoutes(app: FastifyInstance) {
  app.get("/api/system/diagnostics", async (request, reply) => {
    const user = await requireAuth(request, reply);
    if (!user) return reply;

    const prismaState = await tryPrisma();
    const docker = await getDockerVersionSafe();

    const diagnostics: any = {
      generatedAt: new Date().toISOString(),
      runtime: {
        paths: Object.values(runtimePaths).map(pathStatus),
        masterKey: pathStatus(masterKeyPath)
      },
      docker: {
        ok: docker.ok,
        skipped: docker.skipped,
        version: docker.version,
        error: docker.error
      },
      templates: {
        tierOneCount: tierOneTemplates.length,
        engines: tierOneTemplates.map((template) => template.engine)
      },
      metadataDb: {
        ok: prismaState.ok,
        error: prismaState.ok ? null : prismaState.error
      }
    };

    if (prismaState.ok) {
      const [
        instanceCount,
        runningInstanceCount,
        failedInstanceCount,
        jobCount,
        queuedJobCount,
        failedJobCount,
        backupCount,
        recentFailedJobs,
        recentAuditEvents
      ] = await Promise.all([
        prismaState.prisma.instance.count(),
        prismaState.prisma.instance.count({ where: { status: "RUNNING" } }),
        prismaState.prisma.instance.count({ where: { status: "FAILED" } }),
        prismaState.prisma.job.count(),
        prismaState.prisma.job.count({ where: { status: "QUEUED" } }),
        prismaState.prisma.job.count({ where: { status: "FAILED" } }),
        prismaState.prisma.backup.count(),
        prismaState.prisma.job.findMany({
          where: { status: "FAILED" },
          orderBy: { createdAt: "desc" },
          take: 10
        }),
        prismaState.prisma.auditEvent.findMany({
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            actor: {
              select: {
                id: true,
                email: true,
                role: true
              }
            }
          }
        })
      ]);

      diagnostics.counts = {
        instances: instanceCount,
        runningInstances: runningInstanceCount,
        failedInstances: failedInstanceCount,
        jobs: jobCount,
        queuedJobs: queuedJobCount,
        failedJobs: failedJobCount,
        backups: backupCount
      };

      diagnostics.recentFailedJobs = recentFailedJobs;
      diagnostics.recentAuditEvents = recentAuditEvents;
    }

    return diagnostics;
  });

  app.get("/api/system/events", async (request, reply) => {
    const user = await requireAuth(request, reply);
    if (!user) return reply;

    const prismaState = await tryPrisma();

    if (!prismaState.ok) {
      return reply.code(500).send({ error: prismaState.error });
    }

    const events = await prismaState.prisma.systemEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: 200
    });

    return {
      events
    };
  });
}
