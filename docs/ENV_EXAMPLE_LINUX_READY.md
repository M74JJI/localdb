# GitHub-safe `.env.example`

The repository now includes a complete `.env.example` for the Ubuntu/Linux VM test profile.

It intentionally includes the local LAN testing IP:

```txt
192.168.133.131
```

This is safe to commit because it is a private RFC1918 LAN address used only for local VM testing, not a secret.

## Use

```bash
cp .env.example .env
```

Then edit the IP if the VM IP changes:

```bash
hostname -I
```

Replace every `192.168.133.131` value with the active VM IP.

## Important distinction

Server-side API URL:

```env
LOCALDB_HUB_INTERNAL_API_URL=http://localhost:4000
```

Browser-side API URL:

```env
NEXT_PUBLIC_API_BASE_URL=http://192.168.133.131:4000
```

This is required when the browser runs on Windows and the app runs inside Ubuntu VM.
