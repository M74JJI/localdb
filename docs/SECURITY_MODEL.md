# Security Model

## Required from V1

- First-run admin setup.
- Argon2id password hashing.
- HTTP-only session cookies.
- CSRF protection.
- API rate limiting.
- Zod validation on all external inputs.
- Audit logs for destructive actions.
- Encrypted secrets at rest.
- Master key stored at `/opt/localdb-hub/config/master.key` with mode `0600`.
- Docker label ownership enforcement.
- Destructive confirmation text.

## Docker safety

The worker must refuse destructive operations unless the target has LocalDB Hub labels:

```txt
com.localdbhub.managed=true
com.localdbhub.instance_id=...
com.localdbhub.engine=...
```

## Expose modes

- `INTERNAL_ONLY`: Docker network only.
- `LOCAL_ONLY`: bind to `127.0.0.1`.
- `LAN`: bind to `0.0.0.0` with UI warning.
