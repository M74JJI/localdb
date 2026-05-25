import Docker from "dockerode";

export async function waitForContainerRunning(
  docker: Docker,
  containerName: string,
  options?: {
    timeoutMs?: number;
    intervalMs?: number;
  }
) {
  const timeoutMs = options?.timeoutMs ?? 90_000;
  const intervalMs = options?.intervalMs ?? 2_000;
  const startedAt = Date.now();
  const container = docker.getContainer(containerName);

  while (Date.now() - startedAt < timeoutMs) {
    const info = await container.inspect();

    if (info.State?.Running) {
      return true;
    }

    if (info.State?.Status === "exited" || info.State?.Status === "dead") {
      throw new Error(`Container exited during startup: ${info.State?.Error ?? info.State?.Status}`);
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error(`Timed out waiting for container to run: ${containerName}`);
}
