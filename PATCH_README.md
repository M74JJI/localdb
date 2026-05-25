# LocalDB Hub — Phase 25 API CORS / VM Browser Fix

## Problem

`http://192.168.133.131:4000/api/setup/status` works directly in the Windows browser, but the web page at:

```txt
http://192.168.133.131:3000/setup
```

stays on:

```txt
Checking...
```

Direct browser navigation does not test CORS. The web page is cross-origin because:

```txt
Web: http://192.168.133.131:3000
API: http://192.168.133.131:4000
```

So the API must return the proper CORS headers.

## Fix

This patch makes the API:

- Load the root `.env` before reading origin/host/port settings.
- Register explicit CORS handling.
- Allow:
  - `LOCALDB_HUB_WEB_ORIGIN`
  - `http://localhost:3000`
  - `http://127.0.0.1:3000`
  - Same-host LAN origin on port `3000`
- Support credentialed requests.
- Respond to preflight `OPTIONS`.

## Apply

```bash
cd /home/db/localdb
unzip -o /path/to/localdb-hub-phase25-api-cors-vm-fix.zip
rm -rf apps/web/.next
bun run typecheck
bun run build
```

Restart API and web:

```bash
pkill -f "bun run dev:api"
pkill -f "bun run dev:web"
pkill -f "next dev"

bun run dev:api
bun run dev:web
```

## Verify CORS

```bash
curl -i \
  -H "Origin: http://192.168.133.131:3000" \
  http://192.168.133.131:4000/api/setup/status
```

Expected header:

```txt
access-control-allow-origin: http://192.168.133.131:3000
```
