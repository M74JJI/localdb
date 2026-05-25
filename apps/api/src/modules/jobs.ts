import type { FastifyInstance } from "fastify";
import { tryPrisma } from "@localdb-hub/db";
import { requireAuth } from "./auth";

export async function registerJobRoutes(app: FastifyInstance) {
  app.get("/api/jobs", async (request, reply) => {
    const user = await requireAuth(request, reply);
    if (!user) return reply;

    const prismaState = await tryPrisma();

    if (!prismaState.ok) {
      return {
        jobs: [],
        warning: prismaState.error
      };
    }

    const jobs = await prismaState.prisma.job.findMany({
      orderBy: {
        createdAt: "desc"
      },
      take: 100
    });

    return {
      jobs
    };
  });

  app.get("/api/jobs/:id", async (request, reply) => {
    const user = await requireAuth(request, reply);
    if (!user) return reply;

    const { id } = request.params as { id: string };

    const prismaState = await tryPrisma();

    if (!prismaState.ok) {
      return reply.code(500).send({ error: prismaState.error });
    }

    const job = await prismaState.prisma.job.findUnique({
      where: { id },
      include: { logs: true, instance: true }
    });

    if (!job) {
      return reply.code(404).send({ error: "Job not found" });
    }

    return {
      job
    };
  });
}
