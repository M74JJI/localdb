# Switching from Windows Coding to Linux Execution

## Windows mode

Use:

```env
LOCALDB_HUB_DOCKER_ENABLED=false
LOCALDB_HUB_ROOT=./storage
LOCALDB_HUB_MASTER_KEY_PATH=./storage/config/master.key
```

Good for:

```txt
UI
API
auth
SQLite
metadata
backup foundation
worker queue logic
```

## Linux/VM mode

Use:

```env
LOCALDB_HUB_DOCKER_ENABLED=true
LOCALDB_HUB_ROOT=/opt/localdb-hub
LOCALDB_HUB_MASTER_KEY_PATH=/opt/localdb-hub/config/master.key
DOCKER_SOCKET_PATH=/var/run/docker.sock
LOCALDB_HUB_PUBLIC_HOST=<VM_IP>
```

Good for:

```txt
real containers
Docker networks
Docker volumes
database ports
container logs
start/stop/restart/delete
```

## Important

Do not copy your Windows `storage/config/master.key` into production unless you intentionally want to reuse the same local secrets. For a fresh VM, generate a fresh key.
