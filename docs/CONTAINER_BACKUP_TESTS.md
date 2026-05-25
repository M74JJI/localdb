# Container Backup Tests

Run on Debian/Ubuntu with Docker enabled and real containers running.

## PostgreSQL

1. Create PostgreSQL instance.
2. Reveal credentials.
3. Add sample data:

```bash
psql "postgresql://USER:PASSWORD@VM_IP:PORT/DB" -c "create table if not exists test_items(id serial primary key, name text); insert into test_items(name) values('backup-test');"
```

4. Click Backup.
5. Check backup status is `SUCCEEDED`.
6. Confirm file path under:

```txt
/opt/localdb-hub/backups/postgres/<instance>/
```

7. Restore backup.

## MySQL/MariaDB

Create table, insert row, backup, restore.

## MongoDB

Insert document, backup, restore.

## Redis

Backup should create an RDB file. Restore is intentionally not automatic yet.
