export const LOCALDB_HUB_MANAGED_LABEL = "com.localdbhub.managed";

export const ENGINE_TYPES = [
  "postgres",
  "mysql",
  "mariadb",
  "mongodb",
  "redis",
  "sqlite",
  "clickhouse",
  "minio",
  "opensearch",
  "neo4j",
  "rabbitmq",
  "meilisearch",
  "typesense",
  "redpanda"
] as const;

export type EngineType = (typeof ENGINE_TYPES)[number];

export type InstanceStatus =
  | "PENDING"
  | "PULLING_IMAGE"
  | "CREATING_VOLUME"
  | "CREATING_CONTAINER"
  | "STARTING"
  | "HEALTHCHECKING"
  | "RUNNING"
  | "STOPPED"
  | "FAILED"
  | "DELETING"
  | "DELETED"
  | "BACKING_UP"
  | "RESTORING";

export type JobStatus =
  | "QUEUED"
  | "RUNNING"
  | "SUCCEEDED"
  | "FAILED"
  | "CANCELLED"
  | "RETRYING"
  | "WAITING_DOCKER";

export type BackupStatus =
  | "PENDING"
  | "RUNNING"
  | "SUCCEEDED"
  | "FAILED"
  | "RESTORING"
  | "RESTORED";

export * from "./schemas";
