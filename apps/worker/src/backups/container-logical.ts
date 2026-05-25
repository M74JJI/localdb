import { mkdirSync, statSync } from "node:fs";
import { join } from "node:path";
import type { Instance, InstanceSecret } from "@localdb-hub/db";
import { runtimePaths } from "@localdb-hub/config";
import { decryptSecret, sha256File } from "@localdb-hub/security";
import { runCommand } from "./shell";

function timestamp() {
  return new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-");
}

function safeName(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function getPassword(secrets: InstanceSecret[]) {
  const secret = secrets.find((item) => item.name === "password");

  if (!secret) {
    return "";
  }

  return decryptSecret(secret.ciphertext);
}

function backupPath(instance: Instance, extension: string) {
  const dir = join(runtimePaths.backups, instance.engine, instance.name);
  mkdirSync(dir, { recursive: true });
  return join(dir, `${safeName(instance.name)}_${timestamp()}${extension}`);
}

export async function createContainerLogicalBackup(instance: Instance, secrets: InstanceSecret[]) {
  if (!instance.containerName) {
    throw new Error("Instance has no container name");
  }

  const password = getPassword(secrets);
  const dbName = instance.databaseName ?? instance.name;
  const username = instance.username ?? "root";

  if (instance.engine === "postgres") {
    const path = backupPath(instance, ".sql");
    await runCommand("docker", [
      "exec",
      "-e",
      `PGPASSWORD=${password}`,
      instance.containerName,
      "pg_dump",
      "-U",
      username,
      "-d",
      dbName,
      "--no-owner",
      "--no-privileges"
    ], { stdoutFile: path });

    return withMetadata(path);
  }

  if (instance.engine === "mysql") {
    const path = backupPath(instance, ".sql");
    await runCommand("docker", [
      "exec",
      "-e",
      `MYSQL_PWD=${password}`,
      instance.containerName,
      "mysqldump",
      "-u",
      username,
      dbName
    ], { stdoutFile: path });

    return withMetadata(path);
  }

  if (instance.engine === "mariadb") {
    const path = backupPath(instance, ".sql");
    await runCommand("docker", [
      "exec",
      "-e",
      `MARIADB_PWD=${password}`,
      instance.containerName,
      "mariadb-dump",
      "-u",
      username,
      dbName
    ], { stdoutFile: path });

    return withMetadata(path);
  }

  if (instance.engine === "mongodb") {
    const path = backupPath(instance, ".archive");
    await runCommand("docker", [
      "exec",
      instance.containerName,
      "mongodump",
      "--username",
      username,
      "--password",
      password,
      "--authenticationDatabase",
      "admin",
      "--db",
      dbName,
      "--archive"
    ], { stdoutFile: path });

    return withMetadata(path);
  }

  if (instance.engine === "redis") {
    const path = backupPath(instance, ".rdb");
    await runCommand("docker", [
      "exec",
      instance.containerName,
      "redis-cli",
      "-a",
      password,
      "--rdb",
      "-"
    ], { stdoutFile: path });

    return withMetadata(path);
  }

  throw new Error(`Logical backup not implemented for engine: ${instance.engine}`);
}

export async function restoreContainerLogicalBackup(instance: Instance, secrets: InstanceSecret[], backupFilePath: string) {
  if (!instance.containerName) {
    throw new Error("Instance has no container name");
  }

  const password = getPassword(secrets);
  const dbName = instance.databaseName ?? instance.name;
  const username = instance.username ?? "root";

  if (instance.engine === "postgres") {
    await runCommand("docker", [
      "exec",
      "-i",
      "-e",
      `PGPASSWORD=${password}`,
      instance.containerName,
      "psql",
      "-U",
      username,
      "-d",
      dbName
    ], { stdinFile: backupFilePath });

    return;
  }

  if (instance.engine === "mysql") {
    await runCommand("docker", [
      "exec",
      "-i",
      "-e",
      `MYSQL_PWD=${password}`,
      instance.containerName,
      "mysql",
      "-u",
      username,
      dbName
    ], { stdinFile: backupFilePath });

    return;
  }

  if (instance.engine === "mariadb") {
    await runCommand("docker", [
      "exec",
      "-i",
      "-e",
      `MARIADB_PWD=${password}`,
      instance.containerName,
      "mariadb",
      "-u",
      username,
      dbName
    ], { stdinFile: backupFilePath });

    return;
  }

  if (instance.engine === "mongodb") {
    await runCommand("docker", [
      "exec",
      "-i",
      instance.containerName,
      "mongorestore",
      "--username",
      username,
      "--password",
      password,
      "--authenticationDatabase",
      "admin",
      "--archive",
      "--drop"
    ], { stdinFile: backupFilePath });

    return;
  }

  if (instance.engine === "redis") {
    throw new Error("Automatic Redis RDB restore is intentionally not enabled yet. Stop-safe volume restore will be added in a later patch.");
  }

  throw new Error(`Logical restore not implemented for engine: ${instance.engine}`);
}

async function withMetadata(path: string) {
  const stats = statSync(path);
  const checksum = await sha256File(path);

  return {
    path,
    sizeBytes: stats.size,
    checksumSha256: checksum
  };
}
