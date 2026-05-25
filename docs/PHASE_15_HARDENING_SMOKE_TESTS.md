# Phase 15 — Hardening + Smoke Tests

## Critical fixes

### Frontend API helper split

Client components must not import modules that import `next/headers`.

Correct:

```txt
Server components → @/lib/server-api
Client components → @/lib/client-api
```

Compatibility file:

```txt
@/lib/api
```

is server-only and should not be used in client components.

### Caddy API routing

Use:

```txt
handle /api/* {
  reverse_proxy api:4000
}
```

Do not use `handle_path /api/*`, because that strips `/api` before forwarding to Fastify.

## Local validation

```bash
bun install
bun run setup:dev
bun run db:generate
bun run db:push
bun run typecheck
bun run build
```

## API smoke test

Start API:

```bash
bun run dev:api
```

Then:

```bash
bun run smoke:api
```

Expected:

```txt
/health -> 200
/api/system/health -> 200
/api/setup/status -> 200
/api/instances -> 401
```
