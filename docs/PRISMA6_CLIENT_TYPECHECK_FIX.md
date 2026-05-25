# Prisma 6 Client Typecheck Fix

## Why

The project pulled Prisma 7.x, but the current codebase uses the classic generated client import:

```ts
import { PrismaClient } from "@prisma/client";
```

This patch pins:

```json
"@prisma/client": "6.19.0",
"prisma": "6.19.0"
```

and restores:

```prisma
url = env("LOCALDB_HUB_DATABASE_URL")
```

## Required reinstall

Remove the existing Prisma 7 install first:

```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item -Force bun.lock -ErrorAction SilentlyContinue
Remove-Item -Force bun.lockb -ErrorAction SilentlyContinue
```

Then:

```powershell
bun install
bun run setup:dev
bun run db:generate
bun run db:push
bun run typecheck
```
