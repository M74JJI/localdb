# Phase 5 — Backup/Restore Foundation

## Goal

Add backup/restore architecture before implementing all engine-specific commands.

## Works now

- SQLite backup via file copy.
- SQLite restore via file copy.
- Backup metadata.
- Backup and restore jobs.
- Backup UI.
- Restore UI.

## Waiting for Docker/Linux phase

- PostgreSQL `pg_dump` / `pg_restore`.
- MySQL `mysqldump` / `mysql`.
- MariaDB `mariadb-dump` / `mariadb`.
- MongoDB `mongodump` / `mongorestore`.
- Redis RDB/volume backup.

## Windows behavior

Container backup/restore jobs move to `WAITING_DOCKER`.

## Test

1. Create SQLite instance.
2. Wait until job succeeds.
3. Open instance detail.
4. Click Backup.
5. Open Backups page.
6. Open backup detail.
7. Click Restore.
