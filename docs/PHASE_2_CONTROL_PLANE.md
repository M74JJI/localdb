# Phase 2 — Control Plane

## Goal

Add the product layer before Docker execution.

## Included

- Setup status.
- First-run admin creation.
- Login/logout/me.
- Session cookie baseline.
- Instance creation endpoint.
- Port allocation.
- Job creation.
- Connection string generation.
- Dashboard pages.

## Not included yet

- Worker job processing.
- Docker container creation.
- Backup/restore execution.
- Encrypted secret storage.

## Commands

```bash
bun install
bun run db:generate
bun run db:push
bun run dev:api
bun run dev:web
bun run dev:worker
```

## Test

```bash
curl http://localhost:4000/api/setup/status
curl http://localhost:4000/api/templates
curl http://localhost:4000/api/instances
curl http://localhost:4000/api/jobs
```

## UI

Open:

```txt
http://localhost:3000
http://localhost:3000/dashboard
http://localhost:3000/databases
http://localhost:3000/databases/new
http://localhost:3000/jobs
```
