import { copyFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { join } from "node:path";
import type { Job, PrismaClient } from "@localdb-hub/db";
import { runtimePaths } from "@localdb-hub/config";
import { getDockerVersionSafe } from "@localdb-hub/docker";
import { sha256File } from "@localdb-hub/security";
import { appendJobLog } from "./job-log";
import { createContainerLogicalBackup, restoreContainerLogicalBackup } from "../backups/container-logical";

function parsePayload(job: Job) {
  try {
    return JSON.parse(job.payloadJson) as {
      backupId?: string;
      instanceId?: string;
    };
  } catch {
    return {};
  }
}

function timestamp() {
  return new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-");
}

export async function handleBackupInstanceJob(prisma: PrismaClient, job: Job) {
  const payload = parsePayload(job);

  if (!payload.backupId) {
    throw new Error("BACKUP_INSTANCE job missing backupId");
  }

  if (!job.instanceId) {
    throw new Error("BACKUP_INSTANCE job missing instanceId");
  }

  const instance = await prisma.instance.findUnique({
    where: { id: job.instanceId },
    include: { secrets: true }
  });

  if (!instance) {
    throw new Error("Instance not found");
  }

  const backup = await prisma.backup.findUnique({
    where: { id: payload.backupId }
  });

  if (!backup) {
    throw new Error("Backup not found");
  }

  await prisma.backup.update({
    where: { id: backup.id },
    data: { status: "RUNNING" }
  });

  await prisma.instance.update({
    where: { id: instance.id },
    data: { status: "BACKING_UP" }
  });

  await appendJobLog(prisma, job.id, "info", `Starting backup for ${instance.name}.`);

  if (instance.engine === "sqlite") {
    const sqlitePath = join(runtimePaths.data, "sqlite", `${instance.databaseName ?? instance.name}.sqlite`);

    if (!existsSync(sqlitePath)) {
      throw new Error(`SQLite source file does not exist: ${sqlitePath}`);
    }

    const backupDir = join(runtimePaths.backups, "sqlite", instance.name);
    mkdirSync(backupDir, { recursive: true });

    const backupPath = join(backupDir, `${instance.name}_${timestamp()}.sqlite`);

    copyFileSync(sqlitePath, backupPath);

    const stats = statSync(backupPath);
    const checksum = await sha256File(backupPath);

    await prisma.backup.update({
      where: { id: backup.id },
      data: {
        status: "SUCCEEDED",
        path: backupPath,
        sizeBytes: stats.size,
        checksumSha256: checksum,
        completedAt: new Date()
      }
    });

    await prisma.instance.update({
      where: { id: instance.id },
      data: { status: "RUNNING" }
    });

    await appendJobLog(prisma, job.id, "info", `SQLite backup created: ${backupPath}.`);

    return {
      done: true as const,
      message: "SQLite backup completed"
    };
  }

  const dockerState = await getDockerVersionSafe();

  if (!dockerState.ok) {
    await appendJobLog(
      prisma,
      job.id,
      dockerState.skipped ? "warn" : "error",
      dockerState.skipped
        ? "Docker execution is disabled. Backup is waiting for Linux/VM execution."
        : `Docker unavailable: ${dockerState.error}`
    );

    await prisma.backup.update({
      where: { id: backup.id },
      data: { status: "PENDING" }
    });

    await prisma.instance.update({
      where: { id: instance.id },
      data: { status: "RUNNING" }
    });

    await prisma.job.update({
      where: { id: job.id },
      data: {
        status: "WAITING_DOCKER",
        progress: 5,
        message: "Waiting for Docker-enabled backup execution"
      }
    });

    return {
      done: false as const,
      message: "Waiting for Docker"
    };
  }

  await appendJobLog(prisma, job.id, "info", `Docker available: ${dockerState.version}. Running logical backup.`);

  const result = await createContainerLogicalBackup(instance, instance.secrets);

  await prisma.backup.update({
    where: { id: backup.id },
    data: {
      status: "SUCCEEDED",
      path: result.path,
      sizeBytes: result.sizeBytes,
      checksumSha256: result.checksumSha256,
      completedAt: new Date()
    }
  });

  await prisma.instance.update({
    where: { id: instance.id },
    data: { status: "RUNNING" }
  });

  await appendJobLog(prisma, job.id, "info", `Logical backup created: ${result.path}.`);

  return {
    done: true as const,
    message: `${instance.engine} backup completed`
  };
}

export async function handleRestoreBackupJob(prisma: PrismaClient, job: Job) {
  const payload = parsePayload(job);

  if (!payload.backupId) {
    throw new Error("RESTORE_BACKUP job missing backupId");
  }

  if (!job.instanceId) {
    throw new Error("RESTORE_BACKUP job missing instanceId");
  }

  const backup = await prisma.backup.findUnique({
    where: { id: payload.backupId },
    include: {
      instance: {
        include: { secrets: true }
      }
    }
  });

  if (!backup) {
    throw new Error("Backup not found");
  }

  if (!backup.path) {
    throw new Error("Backup path missing");
  }

  const instance = backup.instance;

  await appendJobLog(prisma, job.id, "info", `Starting restore for ${instance.name}.`);

  await prisma.backup.update({
    where: { id: backup.id },
    data: { status: "RESTORING" }
  });

  await prisma.instance.update({
    where: { id: instance.id },
    data: { status: "RESTORING" }
  });

  if (instance.engine === "sqlite") {
    const sqliteDir = join(runtimePaths.data, "sqlite");
    mkdirSync(sqliteDir, { recursive: true });

    const sqlitePath = join(sqliteDir, `${instance.databaseName ?? instance.name}.sqlite`);

    copyFileSync(backup.path, sqlitePath);

    await prisma.backup.update({
      where: { id: backup.id },
      data: { status: "RESTORED" }
    });

    await prisma.instance.update({
      where: { id: instance.id },
      data: { status: "RUNNING" }
    });

    await appendJobLog(prisma, job.id, "info", `SQLite restore completed to ${sqlitePath}.`);

    return {
      done: true as const,
      message: "SQLite restore completed"
    };
  }

  const dockerState = await getDockerVersionSafe();

  if (!dockerState.ok) {
    await appendJobLog(
      prisma,
      job.id,
      dockerState.skipped ? "warn" : "error",
      dockerState.skipped
        ? "Docker execution is disabled. Restore is waiting for Linux/VM execution."
        : `Docker unavailable: ${dockerState.error}`
    );

    await prisma.backup.update({
      where: { id: backup.id },
      data: { status: "SUCCEEDED" }
    });

    await prisma.instance.update({
      where: { id: instance.id },
      data: { status: "RUNNING" }
    });

    await prisma.job.update({
      where: { id: job.id },
      data: {
        status: "WAITING_DOCKER",
        progress: 5,
        message: "Waiting for Docker-enabled restore execution"
      }
    });

    return {
      done: false as const,
      message: "Waiting for Docker"
    };
  }

  await appendJobLog(prisma, job.id, "info", `Docker available: ${dockerState.version}. Running logical restore.`);

  await restoreContainerLogicalBackup(instance, instance.secrets, backup.path);

  await prisma.backup.update({
    where: { id: backup.id },
    data: { status: "RESTORED" }
  });

  await prisma.instance.update({
    where: { id: instance.id },
    data: { status: "RUNNING" }
  });

  await appendJobLog(prisma, job.id, "info", `Logical restore completed from ${backup.path}.`);

  return {
    done: true as const,
    message: `${instance.engine} restore completed`
  };
}
