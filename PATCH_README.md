# LocalDB Hub — Phase 27 Next.js Dev Origin Fix

## Problem

Next.js dev server blocks dev resources/HMR when accessed from the Ubuntu VM LAN IP:

```txt
Blocked cross-origin request to Next.js dev resource /_next/webpack-hmr from "192.168.133.131".
```

This can break hydration/client-side behavior in development.

## Fix

Adds `allowedDevOrigins` to `apps/web/next.config.ts` and documents the env variable:

```env
LOCALDB_HUB_ALLOWED_DEV_ORIGINS=192.168.133.131,192.168.133.131:3000,http://192.168.133.131:3000
```

## Apply

```bash
cd /home/db/localdb
unzip -o /path/to/localdb-hub-phase27-next-dev-origin-fix.zip
rm -rf apps/web/.next
bun run typecheck
bun run build
```

Restart web:

```bash
pkill -f "bun run dev:web"
pkill -f "next dev"
bun run dev:web
```

Hard refresh browser:

```txt
Ctrl + F5
```
