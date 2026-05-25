# Prisma Runtime Init Fix

## Symptom

Runtime API/worker error:

```txt
@prisma/client did not initialize yet. Please run "prisma generate"
```

## Fixes

1. Run Prisma with normal Node-based CLI:

```bash
bunx prisma generate --schema packages/db/prisma/schema.prisma
```

not:

```bash
bunx --bun prisma generate ...
```

2. Load root `.env` from the DB package before creating `PrismaClient`.

## Clean regeneration

```powershell
Remove-Item -Recurse -Force node_modules\.prisma -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules\@prisma\.client -ErrorAction SilentlyContinue

bun install
bun run db:generate
bun run db:push
```
