import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { loginSchema, setupInitializeSchema } from "@localdb-hub/shared";
import { hashPassword, generateToken, sha256, verifyPassword } from "@localdb-hub/security";
import { tryPrisma } from "@localdb-hub/db";

const SESSION_COOKIE = "ldh_session";

function setSessionCookie(reply: FastifyReply, token: string) {
  reply.setCookie(SESSION_COOKIE, token, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 14
  });
}

export async function getCurrentUser(request: FastifyRequest) {
  const token = request.cookies[SESSION_COOKIE];

  if (!token) {
    return null;
  }

  const prismaState = await tryPrisma();
  if (!prismaState.ok) {
    return null;
  }

  const tokenHash = sha256(token);

  const session = await prismaState.prisma.session.findUnique({
    where: { tokenHash },
    include: { user: true }
  });

  if (!session || session.expiresAt.getTime() < Date.now()) {
    return null;
  }

  return session.user;
}

export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  const user = await getCurrentUser(request);

  if (!user) {
    reply.code(401).send({
      error: "Authentication required"
    });
    return null;
  }

  return user;
}

export async function registerAuthRoutes(app: FastifyInstance) {
  app.get("/api/setup/status", async () => {
    const prismaState = await tryPrisma();

    if (!prismaState.ok) {
      return {
        initialized: false,
        metadataDbReady: false,
        error: prismaState.error
      };
    }

    const userCount = await prismaState.prisma.user.count();

    return {
      initialized: userCount > 0,
      metadataDbReady: true
    };
  });

  app.post("/api/setup/initialize", async (request, reply) => {
    const parsed = setupInitializeSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.code(400).send({
        error: "Invalid setup payload",
        issues: parsed.error.flatten()
      });
    }

    const prismaState = await tryPrisma();

    if (!prismaState.ok) {
      return reply.code(500).send({
        error: prismaState.error
      });
    }

    const existingUsers = await prismaState.prisma.user.count();

    if (existingUsers > 0) {
      return reply.code(409).send({
        error: "LocalDB Hub is already initialized"
      });
    }

    const user = await prismaState.prisma.user.create({
      data: {
        email: parsed.data.email,
        passwordHash: await hashPassword(parsed.data.password),
        role: "admin"
      }
    });

    await prismaState.prisma.auditEvent.create({
      data: {
        actorUserId: user.id,
        action: "SETUP_INITIALIZED",
        targetType: "user",
        targetId: user.id
      }
    });

    return {
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    };
  });

  app.post("/api/auth/login", async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.code(400).send({
        error: "Invalid login payload",
        issues: parsed.error.flatten()
      });
    }

    const prismaState = await tryPrisma();

    if (!prismaState.ok) {
      return reply.code(500).send({
        error: prismaState.error
      });
    }

    const user = await prismaState.prisma.user.findUnique({
      where: {
        email: parsed.data.email
      }
    });

    if (!user) {
      return reply.code(401).send({ error: "Invalid credentials" });
    }

    const valid = await verifyPassword(user.passwordHash, parsed.data.password);

    if (!valid) {
      return reply.code(401).send({ error: "Invalid credentials" });
    }

    const token = generateToken();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14);

    await prismaState.prisma.session.create({
      data: {
        userId: user.id,
        tokenHash: sha256(token),
        expiresAt
      }
    });

    await prismaState.prisma.auditEvent.create({
      data: {
        actorUserId: user.id,
        action: "AUTH_LOGIN",
        targetType: "user",
        targetId: user.id
      }
    });

    setSessionCookie(reply, token);

    return {
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    };
  });

  app.post("/api/auth/logout", async (request, reply) => {
    const token = request.cookies[SESSION_COOKIE];

    if (token) {
      const prismaState = await tryPrisma();

      if (prismaState.ok) {
        const tokenHash = sha256(token);
        const session = await prismaState.prisma.session.findUnique({
          where: { tokenHash }
        });

        await prismaState.prisma.session.deleteMany({
          where: {
            tokenHash
          }
        });

        if (session) {
          await prismaState.prisma.auditEvent.create({
            data: {
              actorUserId: session.userId,
              action: "AUTH_LOGOUT",
              targetType: "session",
              targetId: session.id
            }
          });
        }
      }
    }

    reply.clearCookie(SESSION_COOKIE, { path: "/" });

    return {
      ok: true
    };
  });

  app.get("/api/auth/me", async (request) => {
    const user = await getCurrentUser(request);

    return {
      user: user
        ? {
            id: user.id,
            email: user.email,
            role: user.role
          }
        : null
    };
  });
}
