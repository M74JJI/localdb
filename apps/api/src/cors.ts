import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

function getAllowedOrigins() {
  return new Set(
    [
      process.env.LOCALDB_HUB_WEB_ORIGIN,
      "http://localhost:3000",
      "http://127.0.0.1:3000"
    ].filter((origin): origin is string => Boolean(origin))
  );
}

function isSameHostWebOrigin(origin: string, request: FastifyRequest) {
  try {
    const originUrl = new URL(origin);
    const hostHeader = request.headers.host;

    if (!hostHeader) {
      return false;
    }

    const apiHost = hostHeader.split(":")[0];

    return originUrl.protocol === "http:" && originUrl.hostname === apiHost && originUrl.port === "3000";
  } catch {
    return false;
  }
}

function resolveAllowedOrigin(request: FastifyRequest) {
  const origin = request.headers.origin;

  if (!origin) {
    return null;
  }

  const allowedOrigins = getAllowedOrigins();

  if (allowedOrigins.has(origin)) {
    return origin;
  }

  if (isSameHostWebOrigin(origin, request)) {
    return origin;
  }

  return null;
}

function applyCorsHeaders(request: FastifyRequest, reply: FastifyReply) {
  const allowedOrigin = resolveAllowedOrigin(request);

  if (allowedOrigin) {
    reply.header("Access-Control-Allow-Origin", allowedOrigin);
    reply.header("Access-Control-Allow-Credentials", "true");
    reply.header("Vary", "Origin");
  }

  reply.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  reply.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept");
  reply.header("Access-Control-Max-Age", "86400");
}

export async function registerCors(app: FastifyInstance) {
  app.addHook("onRequest", async (request, reply) => {
    applyCorsHeaders(request, reply);

    if (request.method === "OPTIONS") {
      return reply.code(204).send();
    }

    return undefined;
  });

  app.options("/*", async (_request, reply) => {
    return reply.code(204).send();
  });
}
