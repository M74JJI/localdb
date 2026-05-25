import type { PrismaClient } from "@localdb-hub/db";

export async function appendJobLog(
  prisma: PrismaClient,
  jobId: string,
  level: "info" | "warn" | "error",
  message: string
) {
  await prisma.jobLog.create({
    data: {
      jobId,
      level,
      message
    }
  });
}
