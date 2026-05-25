# Windows Development Notes

You can develop LocalDB Hub on Windows.

## What works on Windows now

- Next.js web dashboard.
- Fastify API.
- Prisma/SQLite metadata development.
- Worker code compilation.
- Template system.
- UI/API development.

## What should be tested on Debian/Ubuntu later

- Docker socket access.
- Container lifecycle.
- Linux volume permissions.
- Caddy reverse proxy.
- Database backup/restore commands.
- VM image packaging.

## Expected warnings

### Bun watch warning

You may see:

```txt
File packages/db/src/index.ts is not in the project directory and will not be watched
```

This is a Bun workspace/watch warning on Windows. It is not a blocker.

### Docker unavailable

On Windows, Docker socket `/var/run/docker.sock` usually does not exist unless you are inside WSL/Linux.

For Windows coding, keep:

```env
LOCALDB_HUB_DOCKER_ENABLED=false
```

Later in Debian/Ubuntu:

```env
LOCALDB_HUB_DOCKER_ENABLED=true
DOCKER_SOCKET_PATH=/var/run/docker.sock
```

### Prisma client missing

If you see:

```txt
Cannot find module '.prisma/client/default'
```

Run:

```bash
bun run db:generate
bun run db:push
```

Or directly:

```bash
cd packages/db
bunx --bun prisma generate --config prisma.config.ts
bunx --bun prisma db push --config prisma.config.ts
cd ../..
```
