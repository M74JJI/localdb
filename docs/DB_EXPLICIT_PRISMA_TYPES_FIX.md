# DB Explicit Prisma Types Fix

The DB package now explicitly exports model/client types:

```ts
export { PrismaClient } from "@prisma/client";
export type {
  Instance,
  InstanceSecret,
  Job
} from "@prisma/client";
```

This lets other workspace packages import Prisma types through:

```ts
import type { Job, Instance, InstanceSecret } from "@localdb-hub/db";
```
