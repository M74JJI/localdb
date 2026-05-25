# Phase 11 — Container Logical Backups

## Goal

Add engine-specific logical backups and restores for Docker-managed database containers.

## Implemented backup commands

### PostgreSQL

```bash
docker exec -e PGPASSWORD=... <container> pg_dump -U <user> -d <db> --no-owner --no-privileges
```

### MySQL

```bash
docker exec -e MYSQL_PWD=... <container> mysqldump -u <user> <db>
```

### MariaDB

```bash
docker exec -e MARIADB_PWD=... <container> mariadb-dump -u <user> <db>
```

### MongoDB

```bash
docker exec <container> mongodump --username <user> --password ... --authenticationDatabase admin --db <db> --archive
```

### Redis

```bash
docker exec <container> redis-cli -a <password> --rdb -
```

## Implemented restore commands

### PostgreSQL

```bash
docker exec -i -e PGPASSWORD=... <container> psql -U <user> -d <db>
```

### MySQL

```bash
docker exec -i -e MYSQL_PWD=... <container> mysql -u <user> <db>
```

### MariaDB

```bash
docker exec -i -e MARIADB_PWD=... <container> mariadb -u <user> <db>
```

### MongoDB

```bash
docker exec -i <container> mongorestore --username <user> --password ... --authenticationDatabase admin --archive --drop
```

## Redis restore

Automatic Redis RDB restore is intentionally not enabled yet. It requires a stop-safe volume restore workflow and will be added separately.

## Important

These commands require the `docker` CLI to be available to the worker process in Linux/VM mode.
