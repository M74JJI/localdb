import { tryPrisma } from "@localdb-hub/db";
import { ensureRuntimePaths } from "@localdb-hub/config";
import { handleCreateInstanceJob } from "./jobs/create-instance.job";
import { appendJobLog } from "./jobs/job-log";
import {
  handleDeleteInstanceContainerJob,
  handleRestartInstanceJob,
  handleStartInstanceJob,
  handleStopInstanceJob
} from "./jobs/lifecycle.job";
import { handleBackupInstanceJob, handleRestoreBackupJob } from "./jobs/backup.job";

const claimableStatuses = ["QUEUED", "RETRYING"] as const;

async function claimNextJob() {
  const prismaState = await tryPrisma();

  if (!prismaState.ok) {
    console.warn(`Worker cannot access metadata DB: ${prismaState.error}`);
    return null;
  }

  const prisma = prismaState.prisma;

  const job = await prisma.job.findFirst({
    where: {
      status: {
        in: [...claimableStatuses]
      }
    },
    orderBy: {
      createdAt: "asc"
    }
  });

  if (!job) {
    return null;
  }

  const claimed = await prisma.job.updateMany({
    where: {
      id: job.id,
      status: job.status
    },
    data: {
      status: "RUNNING",
      startedAt: new Date(),
      attempts: {
        increment: 1
      },
      message: "Worker started job"
    }
  });

  if (claimed.count !== 1) {
    return null;
  }

  return prisma.job.findUnique({
    where: { id: job.id }
  });
}

async function completeJob(jobId: string, message: string) {
  const prismaState = await tryPrisma();
  if (!prismaState.ok) return;

  await prismaState.prisma.job.update({
    where: { id: jobId },
    data: {
      status: "SUCCEEDED",
      progress: 100,
      message,
      finishedAt: new Date()
    }
  });

  await appendJobLog(prismaState.prisma, jobId, "info", message);
}

async function failJob(jobId: string, error: unknown) {
  const prismaState = await tryPrisma();
  if (!prismaState.ok) return;

  const message = error instanceof Error ? error.message : "Unknown worker error";

  await prismaState.prisma.job.update({
    where: { id: jobId },
    data: {
      status: "FAILED",
      errorMessage: message,
      message: "Job failed",
      finishedAt: new Date()
    }
  });

  await appendJobLog(prismaState.prisma, jobId, "error", message);
}

export async function processOneJob() {
  ensureRuntimePaths();

  const job = await claimNextJob();

  if (!job) {
    return false;
  }

  const prismaState = await tryPrisma();

  if (!prismaState.ok) {
    console.warn(`Cannot process job without Prisma: ${prismaState.error}`);
    return false;
  }

  await appendJobLog(prismaState.prisma, job.id, "info", `Claimed job ${job.type}.`);

  try {
    let result: { done: boolean; message: string };

    if (job.type === "CREATE_INSTANCE") {
      result = await handleCreateInstanceJob(prismaState.prisma, job);
    } else if (job.type === "START_INSTANCE") {
      result = await handleStartInstanceJob(prismaState.prisma, job);
    } else if (job.type === "STOP_INSTANCE") {
      result = await handleStopInstanceJob(prismaState.prisma, job);
    } else if (job.type === "RESTART_INSTANCE") {
      result = await handleRestartInstanceJob(prismaState.prisma, job);
    } else if (job.type === "DELETE_INSTANCE_CONTAINER") {
      result = await handleDeleteInstanceContainerJob(prismaState.prisma, job);
    } else if (job.type === "BACKUP_INSTANCE") {
      result = await handleBackupInstanceJob(prismaState.prisma, job);
    } else if (job.type === "RESTORE_BACKUP") {
      result = await handleRestoreBackupJob(prismaState.prisma, job);
    } else {
      throw new Error(`Unsupported job type: ${job.type}`);
    }

    if (result.done) {
      await completeJob(job.id, result.message);
    }

    return true;
  } catch (error) {
    await failJob(job.id, error);
    return true;
  }
}

export async function startWorkerLoop() {
  const pollMs = Number(process.env.WORKER_POLL_MS ?? 3000);

  console.log(`Worker polling every ${pollMs}ms.`);

  setInterval(async () => {
    try {
      await processOneJob();
    } catch (error) {
      console.error(error);
    }
  }, pollMs);
}
