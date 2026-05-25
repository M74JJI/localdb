# Backup and Restore

## Logical backup strategies

- PostgreSQL: `pg_dump`
- MySQL: `mysqldump`
- MariaDB: `mariadb-dump`
- MongoDB: `mongodump`
- SQLite: file copy
- Redis: RDB snapshot or volume archive

## Generic fallback

For engines where logical backup is difficult, use volume archive backup first, then add engine-specific strategy later.

## Backup metadata

Each backup should store:

- instance id
- engine
- engine version
- backup type
- file path
- file size
- SHA256 checksum
- created by
- created at
- status
- restore compatibility notes
