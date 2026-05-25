# DB Structural Types Fix

The worker only needs a few model shapes:

```ts
Job
Instance
InstanceSecret
```

Instead of re-exporting Prisma-generated model types directly, the DB package now defines small structural types matching the fields used by the worker.

This avoids version/client-generation differences where some Prisma model types are not exposed as top-level exports.
