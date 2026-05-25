import type { FastifyInstance } from "fastify";
import { tryPrisma } from "@localdb-hub/db";
import { requireAuth } from "./auth";

export async function registerAuditRoutes(app: FastifyInstance) {
  app.get("/api/audit", async (request, reply) => {
    const user = await requireAuth(request, reply);
    if (!user) return reply;

    const prismaState = await tryPrisma();

    if (!prismaState.ok) {
      return reply.code(500).send({ error: prismaState.error });
    }

    const events = await prismaState.prisma.auditEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        actor: {
          select: {
            id: true,
            email: true,
            role: true
          }
        }
      }
    });

    return {
      events
    };
  });
}
