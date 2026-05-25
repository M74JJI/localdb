FROM oven/bun:1 AS deps
WORKDIR /app
COPY package.json bun.lock* turbo.json tsconfig.base.json biome.json ./
COPY apps/api/package.json apps/api/package.json
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
RUN bun --cwd apps/api build

FROM oven/bun:1 AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
EXPOSE 4000
CMD ["bun", "apps/api/dist/main.js"]
