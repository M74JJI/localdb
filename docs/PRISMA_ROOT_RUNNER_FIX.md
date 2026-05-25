# Prisma Root Runner Fix

## Problem

On Windows with Bun 1.3.11, this command prints Bun help instead of executing the workspace script:

```bash
bun --cwd packages/db run generate
```

## Fix

Run Prisma directly from the project root:

```bash
bunx --bun prisma generate --config prisma.config.ts
bunx --bun prisma db push --config prisma.config.ts
```

## Root scripts

```json
"db:generate": "bunx --bun prisma generate --config prisma.config.ts",
"db:push": "bunx --bun prisma db push --config prisma.config.ts"
```

## Config

Root `prisma.config.ts` points to:

```txt
packages/db/prisma/schema.prisma
```

and uses:

```txt
file:./storage/metadata/localdb-hub.sqlite
```
