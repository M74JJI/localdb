import { z } from "zod";

export const exposeModeSchema = z.enum(["INTERNAL_ONLY", "LOCAL_ONLY", "LAN"]);

export const createInstanceSchema = z.object({
  engine: z.enum(["postgres", "mysql", "mariadb", "mongodb", "redis", "sqlite"]),
  version: z.string().min(1).max(32),
  name: z
    .string()
    .min(3)
    .max(64)
    .regex(/^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]$/, "Use letters, numbers, and hyphens only."),
  databaseName: z.string().min(1).max(64).optional(),
  username: z.string().min(1).max(64).optional(),
  passwordMode: z.enum(["auto", "manual"]).default("auto"),
  password: z.string().min(8).max(256).optional(),
  portMode: z.enum(["auto", "manual"]).default("auto"),
  port: z.number().int().min(1).max(65535).optional(),
  exposeMode: exposeModeSchema.default("LOCAL_ONLY"),
  storageMode: z.enum(["persistent", "temporary"]).default("persistent"),
  memoryLimitMb: z.number().int().min(64).max(65536).default(1024),
  cpuLimit: z.number().min(0.1).max(32).default(1)
});

export type CreateInstanceInput = z.infer<typeof createInstanceSchema>;

export const setupInitializeSchema = z.object({
  email: z.string().email(),
  password: z.string().min(10).max(256)
});

export type SetupInitializeInput = z.infer<typeof setupInitializeSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(256)
});

export type LoginInput = z.infer<typeof loginSchema>;
