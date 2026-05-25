import type { FastifyInstance } from "fastify";
import { tryPrisma } from "@localdb-hub/db";
import { requireAuth } from "./auth";

const actions = {
  start: "START_INSTANCE",
  stop: "STOP_INSTANCE",
  restart: "RESTART_INSTANCE",
  "delete-container": "DELETE_INSTANCE_CONTAINER"
} as const;

export async function registerInstanceActionRoutes(app: FastifyInstance) {
  for (const [routeAction, jobType] of Object.entries(actions)) {
    app.post(`/api/instances/:id/${routeAction}`, async (request, reply) => {
      const user = await requireAuth(request, reply);
      if (!user) return reply;

      const { id } = request.params as { id: string };
      const prismaState = await tryPrisma();

      if (!prismaState.ok) {
        return reply.code(500).send({ error: prismaState.error });
      }

      const instance = await prismaState.prisma.instance.findUnique({
        where: { id }
      });

      if (!instance) {
        return reply.code(404).send({ error: "Instance not found" });
      }

      const job = await prismaState.prisma.job.create({
        data: {
          type: jobType,
          status: "QUEUED",
          instanceId: instance.id,
          createdById: user.id,
          payloadJson: JSON.stringify({ instanceId: instance.id }),
          message: `${jobType} queued`
        }
      });

      await prismaState.prisma.jobLog.create({
        data: {
          jobId: job.id,
          level: "info",
          message: `Job ${jobType} created by API control plane.`
        }
      });

      await prismaState.prisma.auditEvent.create({
        data: {
          actorUserId: user.id,
          action: jobType,
          targetType: "instance",
          targetId: instance.id
        }
      });

      return reply.code(202).send({
        job
      });
    });
  }
}
