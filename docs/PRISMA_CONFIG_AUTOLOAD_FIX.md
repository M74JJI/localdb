# Prisma Config Autoload Fix

Prisma automatically loads `prisma.config.ts` from the project root.

The previous file imported:

```ts
import { defineConfig } from "prisma/config";
```

On this Windows/Bun setup, that module failed to resolve and blocked:

```bash
bun run db:generate
bun run db:push
```

The fixed file is import-free:

```ts
export default {};
```

The schema is still passed explicitly:

```bash
bunx prisma generate --schema packages/db/prisma/schema.prisma
```
