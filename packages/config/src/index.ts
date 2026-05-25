import { existsSync, mkdirSync } from "node:fs";

export const DEFAULT_RUNTIME_ROOT = process.env.LOCALDB_HUB_ROOT ?? "/opt/localdb-hub";

export const runtimePaths = {
  root: DEFAULT_RUNTIME_ROOT,
  config: `${DEFAULT_RUNTIME_ROOT}/config`,
  metadata: `${DEFAULT_RUNTIME_ROOT}/metadata`,
  data: `${DEFAULT_RUNTIME_ROOT}/data`,
  backups: `${DEFAULT_RUNTIME_ROOT}/backups`,
  logs: `${DEFAULT_RUNTIME_ROOT}/logs`,
  jobs: `${DEFAULT_RUNTIME_ROOT}/jobs`,
  tmp: `${DEFAULT_RUNTIME_ROOT}/tmp`
} as const;

export const masterKeyPath =
  process.env.LOCALDB_HUB_MASTER_KEY_PATH ?? `${runtimePaths.config}/master.key`;

export function ensureRuntimePaths() {
  for (const path of Object.values(runtimePaths)) {
    if (!existsSync(path)) {
      mkdirSync(path, { recursive: true });
    }
  }
}
