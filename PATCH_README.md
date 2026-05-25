# LocalDB Hub — Phase 28 Runtime Path / Master Key Root Fix

## Problem

Container database creation fails after image/volume setup with:

```txt
Unsupported state or unable to authenticate data
```

Docker is working. The failure happens when the worker decrypts a secret created by the API.

## Root cause

API and Worker are started from different working directories:

```txt
apps/api
apps/worker
```

So relative paths like:

```env
LOCALDB_HUB_ROOT=./storage
LOCALDB_HUB_MASTER_KEY_PATH=./storage/config/master.key
```

can resolve to different physical folders unless the config package normalizes them from the monorepo root.

That causes:

```txt
API encrypts with one master.key
Worker decrypts with another master.key
```

AES-GCM then correctly throws:

```txt
Unsupported state or unable to authenticate data
```

## Fix

`packages/config/src/index.ts` now:

- Finds the monorepo root by walking upward until it finds the root `package.json`.
- Loads the root `.env` file explicitly.
- Resolves relative runtime paths from the monorepo root, not from `apps/api` or `apps/worker`.
- Exposes helper values for diagnostics.

## Apply

```bash
cd /home/db/localdb
unzip -o /path/to/localdb-hub-phase28-runtime-path-root-fix.zip
rm -rf apps/web/.next
bun run typecheck
bun run build
```

## Important dev reset after applying

Because old secrets were already encrypted with the wrong key/path, reset local dev state once:

```bash
pkill -f "bun run dev:api" || true
pkill -f "bun run dev:web" || true
pkill -f "bun run dev:worker" || true
pkill -f "next dev" || true

rm -rf ./storage
rm -rf ./apps/api/storage
rm -rf ./apps/worker/storage
rm -rf ./apps/web/storage

docker rm -f ldh-postgres-test-postgres 2>/dev/null || true
docker rm -f ldh-mysql-test-mysql 2>/dev/null || true
docker volume rm ldh_postgres_test_postgres_data 2>/dev/null || true
docker volume rm ldh_mysql_test_mysql_data 2>/dev/null || true

bun run setup:dev
bun run db:generate
bun run db:push
```

Then start API/Web/Worker and create a fresh admin + fresh database.
