# Phase 12 — Production Docker Compose Packaging

## What changed

Phase 12 packages LocalDB Hub itself as a Compose-managed appliance.

Before:

```txt
bun run dev:web
bun run dev:api
bun run dev:worker
```

After:

```bash
deploy/scripts/compose-up.sh
```

## Public URL

Caddy exposes:

```txt
http://VM_IP:8080
```

Routes:

```txt
/       → web
/api/*  → api
/health → api
```

## Security boundary

Only the worker gets the Docker socket.

## Current limitation

This is a production-like Compose package, not the final Debian installer or OVA image yet. Those come after Compose is validated.
