# Known Good Validation Command Set

## Windows coding mode

```bash
bun install
bun run setup:dev
bun run db:generate
bun run db:push
bun run typecheck
bun run build
```

Terminal 1:

```bash
bun run dev:api
```

Terminal 2:

```bash
bun run dev:web
```

Terminal 3:

```bash
bun run dev:worker
```

Smoke:

```bash
bun run smoke:api
```

Expected Windows behavior:

```txt
Docker: skipped
SQLite: works
Container DB jobs: WAITING_DOCKER
```

## Linux Compose appliance mode

```bash
deploy/scripts/compose-up.sh
deploy/scripts/smoke-appliance.sh http://VM_IP:8080
deploy/scripts/diagnostics.sh
```
