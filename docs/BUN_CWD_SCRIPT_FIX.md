# Bun `--cwd` Script Fix

## Correct pattern

Use:

```bash
bun --cwd packages/db run generate
```

Do not use:

```bash
bun run --cwd packages/db run generate
```

## Fixed scripts

```json
"dev:web": "bun --cwd apps/web run dev",
"dev:api": "bun --cwd apps/api run dev",
"dev:worker": "bun --cwd apps/worker run dev",
"db:generate": "bun --cwd packages/db run generate",
"db:push": "bun --cwd packages/db run db:push",
"db:migrate": "bun --cwd packages/db run migrate",
"db:studio": "bun --cwd packages/db run studio"
```
