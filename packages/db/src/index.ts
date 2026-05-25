export { PrismaClient } from "@prisma/client";
export { getPrisma, tryPrisma } from "./safe-client";

export type Job = {
  id: string;
  type: string;
  status: string;
  instanceId: string | null;
  payloadJson: string;
  progress: number;
  message: string | null;
  errorCode: string | null;
  errorMessage: string | null;
  attempts: number;
  createdById: string | null;
  createdAt: Date;
  startedAt: Date | null;
  finishedAt: Date | null;
};

export type Instance = {
  id: string;
  name: string;
  engine: string;
  version: string;
  status: string;
  host: string | null;
  primaryPort: number | null;
  internalPortsJson: string;
  databaseName: string | null;
  username: string | null;
  exposeMode: string;
  containerName: string | null;
  volumeName: string | null;
  dockerImage: string | null;
  resourceLimitsJson: string;
  createdById: string | null;
  createdAt: Date;
  updatedAt: Date;
  lastHealthCheckAt: Date | null;
};

export type InstanceSecret = {
  id: string;
  instanceId: string;
  name: string;
  ciphertext: string;
  createdAt: Date;
  updatedAt: Date;
};
