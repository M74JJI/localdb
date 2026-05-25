import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, isAbsolute, join, resolve } from "node:path";

function findProjectRoot(startDir = process.cwd()) {
  let current = resolve(startDir);

  while (true) {
    const packageJsonPath = join(current, "package.json");

    if (existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8")) as {
          name?: string;
          workspaces?: unknown;
        };

        if (packageJson.name === "localdb-hub" || Array.isArray(packageJson.workspaces)) {
          return current;
        }
      } catch {
        // Continue walking upward if package.json is unreadable.
      }
    }

    const parent = dirname(current);

    if (parent === current) {
      return resolve(startDir);
    }

    current = parent;
  }
}

export const projectRoot = findProjectRoot();

function loadRootEnv() {
  const envPath = join(projectRoot, ".env");

  if (!existsSync(envPath)) {
    return;
  }

  const content = readFileSync(envPath, "utf8");

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const equalsIndex = line.indexOf("=");

    if (equalsIndex === -1) {
      continue;
    }

    const key = line.slice(0, equalsIndex).trim();
    let value = line.slice(equalsIndex + 1).trim();

    if (!key || process.env[key] !== undefined) {
      continue;
    }

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

loadRootEnv();

export function resolveFromProjectRoot(path: string) {
  return isAbsolute(path) ? path : resolve(projectRoot, path);
}

const configuredRoot = process.env.LOCALDB_HUB_ROOT ?? "./storage";
const root = resolveFromProjectRoot(configuredRoot);

export const runtimePaths = {
  root,
  metadata: resolve(root, "metadata"),
  data: resolve(root, "data"),
  backups: resolve(root, "backups"),
  logs: resolve(root, "logs"),
  config: resolve(root, "config")
};

const configuredMasterKeyPath =
  process.env.LOCALDB_HUB_MASTER_KEY_PATH ?? `${runtimePaths.config}/master.key`;

export const masterKeyPath = resolveFromProjectRoot(configuredMasterKeyPath);

export function ensureRuntimePaths() {
  for (const path of Object.values(runtimePaths)) {
    if (!existsSync(path)) {
      mkdirSync(path, { recursive: true });
    }
  }
}

export const apiConfig = {
  host: process.env.API_HOST ?? "127.0.0.1",
  port: Number(process.env.API_PORT ?? 4000),
  webOrigin: process.env.LOCALDB_HUB_WEB_ORIGIN ?? "http://localhost:3000",
  internalApiUrl: process.env.LOCALDB_HUB_INTERNAL_API_URL ?? "http://localhost:4000"
};

export const webConfig = {
  port: Number(process.env.WEB_PORT ?? 3000),
  publicApiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000"
};

export const dockerConfig = {
  enabled: process.env.LOCALDB_HUB_DOCKER_ENABLED === "true",
  socketPath: process.env.DOCKER_SOCKET_PATH ?? "/var/run/docker.sock",
  publicHost: process.env.LOCALDB_HUB_PUBLIC_HOST ?? "127.0.0.1"
};

export const sessionConfig = {
  cookieName: process.env.LOCALDB_HUB_SESSION_COOKIE ?? "localdb_hub_session",
  secureCookie: process.env.LOCALDB_HUB_COOKIE_SECURE === "true",
  ttlSeconds: Number(process.env.LOCALDB_HUB_SESSION_TTL_SECONDS ?? 604800)
};

export const workerConfig = {
  pollMs: Number(process.env.LOCALDB_HUB_WORKER_POLL_MS ?? 3000)
};

export const runtimeDiagnostics = {
  projectRoot,
  configuredRoot,
  resolvedRoot: root,
  configuredMasterKeyPath,
  resolvedMasterKeyPath: masterKeyPath
};
