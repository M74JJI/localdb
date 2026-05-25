import type { FastifyInstance } from "fastify";
import { createInstanceSchema } from "@localdb-hub/shared";
import { tryPrisma } from "@localdb-hub/db";
import { buildConnectionStrings, getTemplate } from "@localdb-hub/templates";
import { decryptSecret, encryptSecret, generatePassword } from "@localdb-hub/security";
import { allocatePort } from "./ports";
import { requireAuth } from "./auth";

type InstanceSecretRecord = {
  id: string;
  name: string;
  ciphertext: string;
  createdAt: Date;
};

function getHostForExposeMode(exposeMode: string) {
  if (exposeMode === "LAN") {
    return process.env.LOCALDB_HUB_PUBLIC_HOST ?? "127.0.0.1";
  }

  if (exposeMode === "INTERNAL_ONLY") {
    return "localdb-hub-net";
  }

  return "127.0.0.1";
}

function safeDecryptSecret(ciphertext: string) {
  try {
    return decryptSecret(ciphertext);
  } catch {
    return null;
  }
}

export async function registerInstanceRoutes(app: FastifyInstance) {
  app.get("/api/instances", async (request, reply) => {
    const user = await requireAuth(request, reply);
    if (!user) return reply;

    const prismaState = await tryPrisma();

    if (!prismaState.ok) {
      return {
        instances: [],
        warning: prismaState.error
      };
    }

    const instances = await prismaState.prisma.instance.findMany({
      orderBy: {
        createdAt: "desc"
      }
    });

    return {
      instances
    };
  });

  app.get("/api/instances/:id", async (request, reply) => {
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

    return { instance };
  });

  app.get("/api/instances/:id/connection-strings", async (request, reply) => {
    const user = await requireAuth(request, reply);
    if (!user) return reply;

    const { id } = request.params as { id: string };
    const prismaState = await tryPrisma();

    if (!prismaState.ok) {
      return reply.code(500).send({ error: prismaState.error });
    }

    const instance = await prismaState.prisma.instance.findUnique({
      where: { id },
      include: { secrets: true }
    });

    if (!instance) {
      return reply.code(404).send({ error: "Instance not found" });
    }

    const secrets = instance.secrets as InstanceSecretRecord[];
    const passwordSecret = secrets.find((secret: InstanceSecretRecord) => secret.name === "password");
    const password = passwordSecret ? safeDecryptSecret(passwordSecret.ciphertext) : null;

    return {
      connectionStrings: buildConnectionStrings({
        engine: instance.engine as any,
        host: instance.host ?? "127.0.0.1",
        port: instance.primaryPort,
        databaseName: instance.databaseName,
        username: instance.username,
        password,
        sqlitePath:
          instance.engine === "sqlite"
            ? `./storage/data/sqlite/${instance.databaseName ?? instance.name}.sqlite`
            : null
      })
    };
  });

  app.get("/api/instances/:id/secrets", async (request, reply) => {
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

    const secrets = (await prismaState.prisma.instanceSecret.findMany({
      where: { instanceId: id },
      select: {
        id: true,
        name: true,
        ciphertext: true,
        createdAt: true
      }
    })) as InstanceSecretRecord[];

    await prismaState.prisma.auditEvent.create({
      data: {
        actorUserId: user.id,
        action: "INSTANCE_SECRETS_REVEALED",
        targetType: "instance",
        targetId: id,
        metadataJson: JSON.stringify({
          secretNames: secrets.map((secret: InstanceSecretRecord) => secret.name)
        })
      }
    });

    return {
      secrets: secrets.map((secret: InstanceSecretRecord) => ({
        id: secret.id,
        name: secret.name,
        value: safeDecryptSecret(secret.ciphertext),
        createdAt: secret.createdAt
      }))
    };
  });

  app.post("/api/instances", async (request, reply) => {
    const user = await requireAuth(request, reply);
    if (!user) return reply;

    const parsed = createInstanceSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.code(400).send({
        error: "Invalid instance payload",
        issues: parsed.error.flatten()
      });
    }

    const input = parsed.data;
    const template = getTemplate(input.engine);

    if (!template) {
      return reply.code(400).send({
        error: `Unsupported engine: ${input.engine}`
      });
    }

    if (!template.versions.includes(input.version)) {
      return reply.code(400).send({
        error: `Unsupported ${template.displayName} version: ${input.version}`
      });
    }

    const prismaState = await tryPrisma();

    if (!prismaState.ok) {
      return reply.code(500).send({ error: prismaState.error });
    }

    const existing = await prismaState.prisma.instance.findUnique({
      where: { name: input.name }
    });

    if (existing) {
      return reply.code(409).send({ error: "Instance name already exists" });
    }

    const port = input.engine === "sqlite" ? null : await allocatePort(input.engine, input.portMode === "manual" ? input.port : undefined);
    const password = input.passwordMode === "manual" && input.password ? input.password : generatePassword();

    const databaseName = input.databaseName ?? input.name.replaceAll("-", "_");
    const username = input.username ?? `${databaseName}_user`;
    const host = getHostForExposeMode(input.exposeMode);

    const image = template.image?.replace(`:${template.defaultVersion}`, `:${input.version}`) ?? null;

    const instance = await prismaState.prisma.instance.create({
      data: {
        name: input.name,
        engine: input.engine,
        version: input.version,
        status: "PENDING",
        host,
        primaryPort: port,
        internalPortsJson: JSON.stringify(template.internalPorts),
        databaseName,
        username,
        exposeMode: input.exposeMode,
        containerName: input.engine === "sqlite" ? null : `ldh-${input.engine}-${input.name}`,
        volumeName: input.engine === "sqlite" ? null : `ldh_${input.engine}_${input.name.replaceAll("-", "_")}_data`,
        dockerImage: image,
        resourceLimitsJson: JSON.stringify({
          memoryLimitMb: input.memoryLimitMb,
          cpuLimit: input.cpuLimit,
          storageMode: input.storageMode
        }),
        createdById: user.id
      }
    });

    if (port) {
      await prismaState.prisma.portReservation.update({
        where: { port },
        data: {
          instanceId: instance.id,
          status: "ASSIGNED"
        }
      });
    }

    await prismaState.prisma.instanceSecret.create({
      data: {
        instanceId: instance.id,
        name: "password",
        ciphertext: encryptSecret(password)
      }
    });

    await prismaState.prisma.auditEvent.create({
      data: {
        actorUserId: user.id,
        action: "INSTANCE_CREATED",
        targetType: "instance",
        targetId: instance.id,
        metadataJson: JSON.stringify({
          engine: input.engine,
          name: input.name
        })
      }
    });

    const job = await prismaState.prisma.job.create({
      data: {
        type: "CREATE_INSTANCE",
        status: "QUEUED",
        instanceId: instance.id,
        createdById: user.id,
        payloadJson: JSON.stringify({
          instanceId: instance.id,
          engine: input.engine,
          version: input.version
        }),
        message: "Instance creation queued"
      }
    });

    await prismaState.prisma.jobLog.create({
      data: {
        jobId: job.id,
        level: "info",
        message: "Job created by API control plane."
      }
    });

    const connectionStrings = buildConnectionStrings({
      engine: input.engine,
      host,
      port,
      databaseName,
      username,
      password,
      sqlitePath: input.engine === "sqlite" ? `./storage/data/sqlite/${databaseName}.sqlite` : null
    });

    return reply.code(202).send({
      instance,
      job,
      connectionStrings
    });
  });
}
