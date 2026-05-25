import Docker from "dockerode";

export function isDockerEnabled() {
  return process.env.LOCALDB_HUB_DOCKER_ENABLED === "true";
}

export function createDockerClient() {
  return new Docker({
    socketPath: process.env.DOCKER_SOCKET_PATH ?? "/var/run/docker.sock"
  });
}

export const LOCALDB_HUB_DOCKER_LABELS = {
  managed: "com.localdbhub.managed",
  instanceId: "com.localdbhub.instance_id",
  engine: "com.localdbhub.engine",
  name: "com.localdbhub.name"
} as const;

export const LOCALDB_HUB_NETWORK = "localdb-hub-net";

export async function pingDocker() {
  if (!isDockerEnabled()) {
    return false;
  }

  const docker = createDockerClient();
  await docker.ping();
  return true;
}

export async function getDockerVersionSafe() {
  if (!isDockerEnabled()) {
    return {
      ok: false,
      skipped: true,
      version: null,
      error: "Docker checks disabled. Set LOCALDB_HUB_DOCKER_ENABLED=true on Linux/VM when ready."
    };
  }

  try {
    const docker = createDockerClient();
    const version = await docker.version();
    return {
      ok: true,
      skipped: false,
      version: version.Version ?? "unknown"
    };
  } catch (error) {
    return {
      ok: false,
      skipped: false,
      version: null,
      error: error instanceof Error ? error.message : "Unknown Docker error"
    };
  }
}

export async function ensureNetwork(docker: Docker, networkName = LOCALDB_HUB_NETWORK) {
  const networks = (await (docker as unknown as {
    listNetworks: (options?: unknown) => Promise<Array<{ Id?: string; Name?: string }>>;
  }).listNetworks({
    filters: {
      name: [networkName]
    }
  })) ?? [];

  if (networks.length > 0) {
    return docker.getNetwork(networkName);
  }

  return docker.createNetwork({
    Name: networkName,
    Driver: "bridge",
    Labels: {
      [LOCALDB_HUB_DOCKER_LABELS.managed]: "true"
    }
  });
}

export async function ensureVolume(docker: Docker, volumeName: string, labels: Record<string, string>) {
  try {
    await docker.getVolume(volumeName).inspect();
    return docker.getVolume(volumeName);
  } catch {
    await docker.createVolume({
      Name: volumeName,
      Labels: {
        [LOCALDB_HUB_DOCKER_LABELS.managed]: "true",
        ...labels
      }
    });

    return docker.getVolume(volumeName);
  }
}

export async function pullImageIfNeeded(docker: Docker, image: string, onProgress?: (message: string) => Promise<void>) {
  try {
    await docker.getImage(image).inspect();
    await onProgress?.(`Image already available: ${image}`);
    return;
  } catch {
    await onProgress?.(`Pulling image: ${image}`);
  }

  const stream = await docker.pull(image);

  await new Promise<void>((resolve, reject) => {
    docker.modem.followProgress(
      stream,
      (error: Error | null) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      },
      async (event: { status?: string; id?: string }) => {
        if (event?.status) {
          await onProgress?.(`${event.status}${event.id ? ` ${event.id}` : ""}`);
        }
      }
    );
  });
}

export async function stopContainerSafe(docker: Docker, containerName: string) {
  const container = docker.getContainer(containerName);

  try {
    const info = await container.inspect();

    if (info.State?.Running) {
      await container.stop({ t: 15 });
    }

    return true;
  } catch {
    return false;
  }
}

export async function removeManagedContainer(docker: Docker, containerName: string) {
  const container = docker.getContainer(containerName);
  const info = await container.inspect();
  const labels = info.Config?.Labels ?? {};

  if (labels[LOCALDB_HUB_DOCKER_LABELS.managed] !== "true") {
    throw new Error(`Refusing to remove unmanaged container: ${containerName}`);
  }

  if (info.State?.Running) {
    await container.stop({ t: 15 });
  }

  await container.remove({ force: true });
}

export async function execInContainer(
  docker: Docker,
  containerName: string,
  cmd: string[],
  options?: {
    env?: string[];
    workingDir?: string;
    stdout?: boolean;
    stderr?: boolean;
  }
) {
  const container = docker.getContainer(containerName);
  const exec = await container.exec({
    Cmd: cmd,
    Env: options?.env,
    WorkingDir: options?.workingDir,
    AttachStdout: options?.stdout ?? true,
    AttachStderr: options?.stderr ?? true
  });

  const stream = await exec.start({ hijack: true, stdin: false });

  let output = "";

  await new Promise<void>((resolve, reject) => {
    stream.on("data", (chunk: Buffer) => {
      output += chunk.toString("utf8");
    });
    stream.on("error", reject);
    stream.on("end", resolve);
  });

  const inspect = await exec.inspect();

  if (inspect.ExitCode !== 0) {
    throw new Error(`Container command failed (${inspect.ExitCode}): ${cmd.join(" ")}\n${output}`);
  }

  return output;
}

export async function putArchiveToContainer(docker: Docker, containerName: string, archive: NodeJS.ReadableStream, path: string) {
  const container = docker.getContainer(containerName);
  await container.putArchive(archive, { path });
}

export async function getArchiveFromContainer(docker: Docker, containerName: string, path: string) {
  const container = docker.getContainer(containerName);
  return container.getArchive({ path });
}
