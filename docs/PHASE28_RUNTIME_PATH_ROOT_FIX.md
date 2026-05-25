# Phase 28 Runtime Path / Master Key Root Fix

The API and worker run from different package directories, but runtime paths must resolve from the monorepo root.

Without this, relative paths such as:

```env
LOCALDB_HUB_ROOT=./storage
LOCALDB_HUB_MASTER_KEY_PATH=./storage/config/master.key
```

can point to different folders:

```txt
apps/api/storage
apps/worker/storage
```

That breaks AES-GCM secret decryption and produces:

```txt
Unsupported state or unable to authenticate data
```

The config package now loads root `.env` and resolves relative runtime paths from the monorepo root.
