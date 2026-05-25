# Node Types Fix

Server-side packages using Node.js APIs must include:

```json
"devDependencies": {
  "@types/node": "latest"
}
```

and in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "types": ["node"]
  }
}
```

This patch applies that to:

- packages/config
- packages/docker
- packages/security
- packages/db
- apps/api
- apps/worker
