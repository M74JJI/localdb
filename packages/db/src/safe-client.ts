import { PrismaClient } from "@prisma/client";
import { loadRootEnv } from "./env";

loadRootEnv();

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export function getPrisma() {
  loadRootEnv();

  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  const prisma = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"]
  });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
  }

  return prisma;
}

export async function tryPrisma() {
  try {
    const prisma = getPrisma();

    return {
      ok: true as const,
      prisma
    };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Unknown Prisma error"
    };
  }
}
