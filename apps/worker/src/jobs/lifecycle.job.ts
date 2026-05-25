import type { Job, PrismaClient } from "@localdb-hub/db";
import { createDockerClient, getDockerVersionSafe, removeManagedContainer, stopContainerSafe } from "@localdb-hub/docker";
import { appendJobLog } from "./job-log";

async function getInstance(prisma: PrismaClient, job: Job) {
  if (!job.instanceId) {
    throw new Error(`${job.type} job is missing instanceId`);
  }

  const instance = await prisma.instance.findUnique({
    where: { id: job.instanceId }
  });

  if (!instance) {
    throw new Error(`Instance not found for job ${job.id}`);
  }

  return instance;
}

async function requireDocker() {
  const dockerState = await getDockerVersionSafe();

  if (!dockerState.ok) {
    return {
      ok: false as const,
      message: dockerState.skipped
        ? "Docker execution is disabled for this environment."
        : `Docker unavailable: ${dockerState.error}`
    };
  }

  return {
    ok: true as const,
    docker: createDockerClient()
  };
}

export async function handleStartInstanceJob(prisma: PrismaClient, job: Job) {
  const instance = await getInstance(prisma, job);

  if (!instance.containerName) {
    throw new Error("Instance has no container to start");
  }

  const dockerState = await requireDocker();

  if (!dockerState.ok) {
    await appendJobLog(prisma, job.id, "warn", dockerState.message);
    await prisma.job.update({
      where: { id: job.id },
      data: { status: "WAITING_DOCKER", message: "Waiting for Docker-enabled environment" }
    });
    return { done: false as const, message: "Waiting for Docker" };
  }

  const container = dockerState.docker.getContainer(instance.containerName);
  const info = await container.inspect();

  if (!info.State?.Running) {
    await container.start();
  }

  await prisma.instance.update({
    where: { id: instance.id },
    data: {
      status: "RUNNING",
      lastHealthCheckAt: new Date()
    }
  });

  await appendJobLog(prisma, job.id, "info", `Started ${instance.containerName}.`);
  return { done: true as const, message: "Instance started" };
}

export async function handleStopInstanceJob(prisma: PrismaClient, job: Job) {
  const instance = await getInstance(prisma, job);

  if (!instance.containerName) {
    throw new Error("Instance has no container to stop");
  }

  const dockerState = await requireDocker();

  if (!dockerState.ok) {
    await appendJobLog(prisma, job.id, "warn", dockerState.message);
    await prisma.job.update({
      where: { id: job.id },
      data: { status: "WAITING_DOCKER", message: "Waiting for Docker-enabled environment" }
    });
    return { done: false as const, message: "Waiting for Docker" };
  }

  await stopContainerSafe(dockerState.docker, instance.containerName);

  await prisma.instance.update({
    where: { id: instance.id },
    data: { status: "STOPPED" }
  });

  await appendJobLog(prisma, job.id, "info", `Stopped ${instance.containerName}.`);
  return { done: true as const, message: "Instance stopped" };
}

export async function handleRestartInstanceJob(prisma: PrismaClient, job: Job) {
  const instance = await getInstance(prisma, job);

  if (!instance.containerName) {
    throw new Error("Instance has no container to restart");
  }

  const dockerState = await requireDocker();

  if (!dockerState.ok) {
    await appendJobLog(prisma, job.id, "warn", dockerState.message);
    await prisma.job.update({
      where: { id: job.id },
      data: { status: "WAITING_DOCKER", message: "Waiting for Docker-enabled environment" }
    });
    return { done: false as const, message: "Waiting for Docker" };
  }

  const container = dockerState.docker.getContainer(instance.containerName);
  await container.restart({ t: 15 });

  await prisma.instance.update({
    where: { id: instance.id },
    data: {
      status: "RUNNING",
      lastHealthCheckAt: new Date()
    }
  });

  await appendJobLog(prisma, job.id, "info", `Restarted ${instance.containerName}.`);
  return { done: true as const, message: "Instance restarted" };
}

export async function handleDeleteInstanceContainerJob(prisma: PrismaClient, job: Job) {
  const instance = await getInstance(prisma, job);

  if (!instance.containerName) {
    throw new Error("Instance has no container to delete");
  }

  const dockerState = await requireDocker();

  if (!dockerState.ok) {
    await appendJobLog(prisma, job.id, "warn", dockerState.message);
    await prisma.job.update({
      where: { id: job.id },
      data: { status: "WAITING_DOCKER", message: "Waiting for Docker-enabled environment" }
    });
    return { done: false as const, message: "Waiting for Docker" };
  }

  await prisma.instance.update({
    where: { id: instance.id },
    data: { status: "DELETING" }
  });

  await removeManagedContainer(dockerState.docker, instance.containerName);

  await prisma.instance.update({
    where: { id: instance.id },
    data: { status: "DELETED" }
  });

  await appendJobLog(prisma, job.id, "info", `Deleted container ${instance.containerName}. Data volume was preserved.`);
  return { done: true as const, message: "Instance container deleted; data volume preserved" };
}
