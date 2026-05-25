# Finalized `.env.example`

`.env.example` is GitHub-safe and complete for the Ubuntu VM test profile.

It includes:

- Project-local runtime storage
- SQLite metadata database path
- Master key path placeholder
- API bind host/port
- Web port
- Internal server-side API URL
- Browser-side API URL
- CORS web origin
- Docker socket path
- Docker enabled flag
- Public host for generated connection strings
- Session defaults
- Worker polling interval
- Verification commands

## Safe to commit

The file includes:

```txt
192.168.133.131
```

This is a private LAN testing IP, not a secret.

## Not safe to commit

Do not commit:

```txt
.env
storage/config/master.key
storage/
```
