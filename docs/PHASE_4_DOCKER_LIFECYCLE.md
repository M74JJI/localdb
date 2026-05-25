# Phase 4 — Docker Lifecycle

## Goal

Create real database containers from queued jobs when Docker is enabled.

## Supported engines

- PostgreSQL
- MySQL
- MariaDB
- MongoDB
- Redis
- SQLite

SQLite creates a local file and does not require Docker.

## Environment

### Windows development

```env
LOCALDB_HUB_DOCKER_ENABLED=false
```

Docker jobs wait safely.

### Debian/Ubuntu execution

```env
LOCALDB_HUB_DOCKER_ENABLED=true
DOCKER_SOCKET_PATH=/var/run/docker.sock
LOCALDB_HUB_PUBLIC_HOST=192.168.x.x
```

## Docker resources

The worker creates:

- network: `localdb-hub-net`
- containers: `ldh-<engine>-<name>`
- volumes: `ldh_<engine>_<name>_data`

## Safety

The worker labels all managed resources and refuses to remove unmanaged containers.
