# LocalDB Hub

LocalDB Hub is a self-hosted local database control center for developers and teams.

It lets users create, start, stop, inspect, back up, restore, and delete local development databases from one web dashboard.

## Windows development

```bash
bun install
bun run setup:dev
bun run db:generate
bun run db:push
bun run typecheck
bun run build
bun run dev:api
bun run dev:web
bun run dev:worker
```

Keep Docker disabled in `.env` on Windows unless using a compatible Linux/WSL Docker socket:

```env
LOCALDB_HUB_DOCKER_ENABLED=false
```

Smoke test:

```bash
bun run smoke:api
```

## Debian/Ubuntu one-command install

```bash
chmod +x deploy/scripts/*.sh
deploy/scripts/install-debian.sh
```

Open:

```txt
http://VM_IP:8080
```

## Linux appliance smoke test

```bash
deploy/scripts/smoke-appliance.sh http://VM_IP:8080
```
