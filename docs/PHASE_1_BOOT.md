# Phase 1 — Boot Baseline

## Goal

Make sure the project runs cleanly before database lifecycle work starts.

## Windows-friendly commands

```bash
bun install
bun run setup:dev
bun run db:generate
bun run db:push
bun run dev:api
bun run dev:web
bun run dev:worker
```

## Expected checks

```bash
curl http://localhost:4000/health
curl http://localhost:4000/api/templates
curl http://localhost:4000/api/system/health
```

## Expected result on Windows

- API returns `status: ok`.
- Templates endpoint returns six Tier 1 engines.
- Metadata DB should become `ok` after `db:generate` and `db:push`.
- Docker should show `skipped` unless `LOCALDB_HUB_DOCKER_ENABLED=true`.

## Expected result on Debian/Ubuntu later

- Docker should show `ok:<version>` when Docker Engine is installed and socket access is available.
