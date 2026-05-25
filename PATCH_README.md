# LocalDB Hub — Phase 23 Browser API VM Fix

## Problem

The API works directly in the Windows browser:

```txt
http://192.168.133.131:4000/api/setup/status
```

but `/setup` stays on:

```txt
Checking...
```

This means the frontend client-side API helper is not reaching the API correctly from the browser.

## Fix

`apps/web/src/lib/client-api.ts` now resolves the API base safely:

- If `NEXT_PUBLIC_API_BASE_URL` is usable, use it.
- If it is missing, localhost, or stale, derive the API URL from the current browser host:
  - Web opened at `http://192.168.133.131:3000`
  - API becomes `http://192.168.133.131:4000`

Also makes browser fetches use `credentials: "include"` so auth cookies work correctly.

## Apply

```bash
cd /home/db/localdb-test/localdb
unzip -o /path/to/localdb-hub-phase23-browser-api-vm-fix.zip
rm -rf apps/web/.next
bun run typecheck
bun run build
```

Then restart API and Web:

```bash
bun run dev:api
bun run dev:web
```

Hard refresh browser:

```txt
Ctrl + F5
```
