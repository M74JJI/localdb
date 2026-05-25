import { createServer } from "node:net";
import { tryPrisma } from "@localdb-hub/db";
import { getTemplate } from "@localdb-hub/templates";
import type { EngineType } from "@localdb-hub/shared";

async function isPortFree(port: number) {
  return new Promise<boolean>((resolve) => {
    const server = createServer();

    server.once("error", () => resolve(false));
    server.once("listening", () => {
      server.close(() => resolve(true));
    });

    server.listen(port, "0.0.0.0");
  });
}

export async function allocatePort(engine: EngineType, requestedPort?: number) {
  const template = getTemplate(engine);

  if (!template?.defaultPort) {
    return null;
  }

  const prismaState = await tryPrisma();
  if (!prismaState.ok) {
    throw new Error(prismaState.error);
  }

  const candidates: number[] = [];

  if (requestedPort) {
    candidates.push(requestedPort);
  } else {
    candidates.push(template.defaultPort);

    if (template.fallbackPortRange) {
      const [start, end] = template.fallbackPortRange;
      for (let port = start; port <= end; port++) {
        candidates.push(port);
      }
    }
  }

  for (const port of candidates) {
    const existing = await prismaState.prisma.portReservation.findUnique({
      where: { port }
    });

    if (existing) {
      continue;
    }

    if (!(await isPortFree(port))) {
      continue;
    }

    const reservation = await prismaState.prisma.portReservation.create({
      data: {
        port,
        protocol: "tcp",
        status: "RESERVED"
      }
    });

    return reservation.port;
  }

  throw new Error(`No free port available for ${engine}`);
}
