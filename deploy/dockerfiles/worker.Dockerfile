FROM oven/bun:1 AS deps
WORKDIR /app
COPY package.json bun.lock* turbo.json tsconfig.base.json biome.json ./
COPY apps/worker/package.json apps/worker/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY packages/templates/package.json packages/templates/package.json
COPY packages/docker/package.json packages/docker/package.json
COPY packages/security/package.json packages/security/package.json
COPY packages/config/package.json packages/config/package.json
RUN bun install --frozen-lockfile || bun install

FROM deps AS builder
WORKDIR /app
COPY . .
RUN bun --cwd packages/db run generate
RUN bun --cwd apps/worker build

FROM oven/bun:1 AS runner
WORKDIR /app
ENV NODE_ENV=production
# Docker CLI is required for logical backup/restore jobs.
RUN apt-get update && apt-get install -y --no-install-recommends docker.io ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/apps/worker/dist ./apps/worker/dist
COPY --from=builder /app/apps/worker/package.json ./apps/worker/package.json
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
CMD ["bun", "apps/worker/dist/main.js"]
