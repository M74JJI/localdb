import { getDockerVersionSafe } from "@localdb-hub/docker";
import { tierOneTemplates } from "@localdb-hub/templates";
import { ensureRuntimePaths } from "@localdb-hub/config";
import { startWorkerLoop } from "./runner";

async function boot() {
  ensureRuntimePaths();

  console.log("LocalDB Hub worker starting...");
  console.log(`Loaded ${tierOneTemplates.length} tier-one database templates.`);

  const docker = await getDockerVersionSafe();

  if (docker.ok) {
    console.log(`Docker is reachable. Version: ${docker.version}`);
  } else if (docker.skipped) {
    console.log(docker.error);
  } else {
    console.warn(`Docker is not reachable yet: ${docker.error}`);
  }

  await startWorkerLoop();
}

await boot();
