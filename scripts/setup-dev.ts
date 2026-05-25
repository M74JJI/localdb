import { existsSync, mkdirSync, copyFileSync, writeFileSync, chmodSync, readFileSync } from "node:fs";
import { randomBytes } from "node:crypto";

const folders = [
  "storage",
  "storage/config",
  "storage/metadata",
  "storage/data",
  "storage/backups",
  "storage/logs",
  "storage/jobs",
  "storage/tmp"
];

for (const folder of folders) {
  mkdirSync(folder, { recursive: true });
}

if (!existsSync(".env")) {
  copyFileSync(".env.example", ".env");
  console.log("Created .env from .env.example");
} else {
  let current = readFileSync(".env", "utf8");

  if (current.includes("LOCALDB_HUB_DATABASE_URL=file:../../storage/metadata/localdb-hub.sqlite")) {
    current = current.replace(
      "LOCALDB_HUB_DATABASE_URL=file:../../storage/metadata/localdb-hub.sqlite",
      "LOCALDB_HUB_DATABASE_URL=file:./storage/metadata/localdb-hub.sqlite"
    );
    writeFileSync(".env", current);
    console.log("Fixed LOCALDB_HUB_DATABASE_URL in existing .env");
  }
}

const masterKeyPath = "storage/config/master.key";

if (!existsSync(masterKeyPath)) {
  writeFileSync(masterKeyPath, randomBytes(32).toString("base64url"));
  try {
    chmodSync(masterKeyPath, 0o600);
  } catch {
    // Windows may not fully support POSIX mode bits. This is okay for local dev.
  }
  console.log("Created development master key at storage/config/master.key");
}

console.log("LocalDB Hub dev folders are ready.");
console.log("Metadata DB path: storage/metadata/localdb-hub.sqlite");
console.log("Master key path: storage/config/master.key");
console.log("");
console.log("Windows note:");
console.log("- Docker checks are disabled by default with LOCALDB_HUB_DOCKER_ENABLED=false.");
console.log("- Full Docker/database lifecycle will be tested inside Debian/Ubuntu later.");
