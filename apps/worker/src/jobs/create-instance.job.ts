import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Job, PrismaClient } from "@localdb-hub/db";
import { runtimePaths } from "@localdb-hub/config";
import {
  createDockerClient,
  ensureNetwork,
  ensureVolume,
  getDockerVersionSafe,
  pullImageIfNeeded
} from "@localdb-hub/docker";
import { appendJobLog } from "./job-log";
import { buildContainerCreateOptions } from "../docker/container-specs";
import { waitForContainerRunning } from "../docker/health";

export async function handleCreateInstanceJob(prisma: PrismaClient, job: Job) {
  if (!job.instanceId) {
    throw new Error("CREATE_INSTANCE job is missing instanceId");
  }

  const instance = await prisma.instance.findUnique({
    where: {
      id: job.instanceId
    },
    include: {
      secrets: true
    }
  });

  if (!instance) {
    throw new Error(`Instance not found for job ${job.id}`);
  }

  await appendJobLog(prisma, job.id, "info", `Preparing ${instance.engine} instance '${instance.name}'.`);

  if (instance.engine === "sqlite") {
    const sqliteDir = join(runtimePaths.data, "sqlite");
    mkdirSync(sqliteDir, { recursive: true });

    const dbPath = join(sqliteDir, `${instance.databaseName ?? instance.name}.sqlite`);

    if (!existsSync(dbPath)) {
      writeFileSync(dbPath, "");
    }

    await prisma.instance.update({
      where: { id: instance.id },
      data: {
        status: "RUNNING",
        host: "local-file",
        dockerImage: null,
        containerName: null,
        volumeName: null
      }
    });

    await appendJobLog(prisma, job.id, "info", `SQLite file created at ${dbPath}.`);
    return {
      done: true as const,
      message: "SQLite instance created"
    };
  }

  const dockerState = await getDockerVersionSafe();

  if (!dockerState.ok) {
    await appendJobLog(
      prisma,
      job.id,
      dockerState.skipped ? "warn" : "error",
      dockerState.skipped
        ? "Docker execution is disabled for this environment. Job is waiting for Linux/VM execution."
        : `Docker is unavailable: ${dockerState.error}`
    );

    await prisma.job.update({
      where: { id: job.id },
      data: {
        status: "WAITING_DOCKER",
        progress: 5,
        message: "Waiting for Docker-enabled environment"
      }
    });

    return {
      done: false as const,
      message: "Waiting for Docker"
    };
  }

  if (!instance.dockerImage || !instance.containerName || !instance.volumeName) {
    throw new Error("Instance Docker metadata is incomplete");
  }

  const docker = createDockerClient();

  await prisma.instance.update({
    where: { id: instance.id },
    data: { status: "PULLING_IMAGE" }
  });

  await appendJobLog(prisma, job.id, "info", `Docker reachable: ${dockerState.version}.`);
  await ensureNetwork(docker);
  await appendJobLog(prisma, job.id, "info", "Ensured LocalDB Hub Docker network.");

  await pullImageIfNeeded(docker, instance.dockerImage, async (message) => {
    await appendJobLog(prisma, job.id, "info", message);
  });

  await prisma.job.update({
    where: { id: job.id },
    data: { progress: 35, message: "Image ready" }
  });

  await prisma.instance.update({
    where: { id: instance.id },
    data: { status: "CREATING_VOLUME" }
  });

  await ensureVolume(docker, instance.volumeName, {
    "com.localdbhub.instance_id": instance.id,
    "com.localdbhub.engine": instance.engine,
    "com.localdbhub.name": instance.name
  });

  await appendJobLog(prisma, job.id, "info", `Ensured volume ${instance.volumeName}.`);

  await prisma.instance.update({
    where: { id: instance.id },
    data: { status: "CREATING_CONTAINER" }
  });

  const createOptions = buildContainerCreateOptions(instance, instance.secrets);

  try {
    await docker.getContainer(instance.containerName).inspect();
    await appendJobLog(prisma, job.id, "warn", `Container ${instance.containerName} already exists. Reusing it.`);
  } catch {
    await docker.createContainer(createOptions);
    await appendJobLog(prisma, job.id, "info", `Created container ${instance.containerName}.`);
  }

  await prisma.job.update({
    where: { id: job.id },
    data: { progress: 70, message: "Container created" }
  });

  await prisma.instance.update({
    where: { id: instance.id },
    data: { status: "STARTING" }
  });

  const container = docker.getContainer(instance.containerName);
  const info = await container.inspect();

  if (!info.State?.Running) {
    await container.start();
  }

  await appendJobLog(prisma, job.id, "info", `Started container ${instance.containerName}.`);

  await prisma.instance.update({
    where: { id: instance.id },
    data: { status: "HEALTHCHECKING" }
  });

  await waitForContainerRunning(docker, instance.containerName);

  await prisma.instance.update({
    where: { id: instance.id },
    data: {
      status: "RUNNING",
      lastHealthCheckAt: new Date()
    }
  });

  await appendJobLog(prisma, job.id, "info", `${instance.name} is running.`);

  return {
    done: true as const,
    message: `${instance.engine} instance created and running`
  };
}
