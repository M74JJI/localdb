import type { FastifyInstance } from "fastify";
import { tryPrisma } from "@localdb-hub/db";
import { requireAuth } from "./auth";

export async function registerBackupRoutes(app: FastifyInstance) {
  app.post("/api/instances/:id/backup", async (request, reply) => {
    const user = await requireAuth(request, reply);
    if (!user) return reply;

    const { id } = request.params as { id: string };
    const prismaState = await tryPrisma();

    if (!prismaState.ok) {
      return reply.code(500).send({ error: prismaState.error });
    }

    const instance = await prismaState.prisma.instance.findUnique({
      where: { id }
    });

    if (!instance) {
      return reply.code(404).send({ error: "Instance not found" });
    }

    const backup = await prismaState.prisma.backup.create({
      data: {
        instanceId: instance.id,
        createdById: user.id,
        type: instance.engine === "sqlite" ? "sqlite-file-copy" : "logical",
        status: "PENDING"
      }
    });

    const job = await prismaState.prisma.job.create({
      data: {
        type: "BACKUP_INSTANCE",
        status: "QUEUED",
        instanceId: instance.id,
        createdById: user.id,
        payloadJson: JSON.stringify({
          instanceId: instance.id,
          backupId: backup.id
        }),
        message: "Backup queued"
      }
    });

    await prismaState.prisma.jobLog.create({
      data: {
        jobId: job.id,
        level: "info",
        message: "Backup job created by API control plane."
      }
    });

    await prismaState.prisma.auditEvent.create({
      data: {
        actorUserId: user.id,
        action: "BACKUP_QUEUED",
        targetType: "backup",
        targetId: backup.id
      }
    });

    return reply.code(202).send({
      backup,
      job
    });
  });

  app.get("/api/backups", async (request, reply) => {
    const user = await requireAuth(request, reply);
    if (!user) return reply;

    const prismaState = await tryPrisma();

    if (!prismaState.ok) {
      return {
        backups: [],
        warning: prismaState.error
      };
    }

    const backups = await prismaState.prisma.backup.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        instance: true
      },
      take: 100
    });

    return { backups };
  });

  app.get("/api/backups/:id", async (request, reply) => {
    const user = await requireAuth(request, reply);
    if (!user) return reply;

    const { id } = request.params as { id: string };
    const prismaState = await tryPrisma();

    if (!prismaState.ok) {
      return reply.code(500).send({ error: prismaState.error });
    }

    const backup = await prismaState.prisma.backup.findUnique({
      where: { id },
      include: {
        instance: true
      }
    });

    if (!backup) {
      return reply.code(404).send({ error: "Backup not found" });
    }

    return { backup };
  });

  app.post("/api/backups/:id/restore", async (request, reply) => {
    const user = await requireAuth(request, reply);
    if (!user) return reply;

    const { id } = request.params as { id: string };
    const prismaState = await tryPrisma();

    if (!prismaState.ok) {
      return reply.code(500).send({ error: prismaState.error });
    }

    const backup = await prismaState.prisma.backup.findUnique({
      where: { id },
      include: { instance: true }
    });

    if (!backup) {
      return reply.code(404).send({ error: "Backup not found" });
    }

    if (backup.status !== "SUCCEEDED" && backup.status !== "RESTORED") {
      return reply.code(409).send({ error: "Backup is not restorable yet" });
    }

    if (!backup.path) {
      return reply.code(409).send({ error: "Backup path missing" });
    }

    const job = await prismaState.prisma.job.create({
      data: {
        type: "RESTORE_BACKUP",
        status: "QUEUED",
        instanceId: backup.instanceId,
        createdById: user.id,
        payloadJson: JSON.stringify({
          instanceId: backup.instanceId,
          backupId: backup.id
        }),
        message: "Restore queued"
      }
    });

    await prismaState.prisma.jobLog.create({
      data: {
        jobId: job.id,
        level: "info",
        message: "Restore job created by API control plane."
      }
    });

    await prismaState.prisma.auditEvent.create({
      data: {
        actorUserId: user.id,
        action: "RESTORE_QUEUED",
        targetType: "backup",
        targetId: backup.id
      }
    });

    return reply.code(202).send({
      backup,
      job
    });
  });
}
