# Worker Type Imports Fix

The worker should import Prisma-generated types through the workspace DB package:

```ts
import type { Job, PrismaClient } from "@localdb-hub/db";
```

instead of importing directly from:

```ts
@prisma/client
```

This keeps package boundaries clean and avoids worker-local resolution failures.
