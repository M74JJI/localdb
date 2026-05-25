# Container Lifecycle Tests

Run these on Debian/Ubuntu with Docker enabled.

## Pre-check

```bash
source .env
deploy/scripts/check-docker-ready.sh
curl http://localhost:4000/api/system/health
```

## UI tests

Open:

```txt
http://VM_IP:3000
```

Create admin, login, then create instances.

## PostgreSQL test

Create from UI:

```txt
Engine: postgres
Version: 16
Name: pg-test
Database: pg_test
Username: pg_user
Expose mode: LOCAL_ONLY or LAN
```

Expected:

```txt
Job: SUCCEEDED
Instance: RUNNING
Container: ldh-postgres-pg-test
Volume: ldh_postgres_pg_test_data
```

Shell:

```bash
docker ps | grep ldh-postgres-pg-test
docker logs ldh-postgres-pg-test --tail 30
```

If LAN exposed and port is visible:

```bash
psql "postgresql://pg_user:PASSWORD@VM_IP:5432/pg_test"
```

## Redis test

Create:

```txt
Engine: redis
Name: redis-test
```

Shell:

```bash
docker ps | grep ldh-redis-redis-test
docker logs ldh-redis-redis-test --tail 30
```

Connect:

```bash
redis-cli -h VM_IP -p 6379 -a PASSWORD ping
```

Expected:

```txt
PONG
```

## MongoDB test

Create:

```txt
Engine: mongodb
Name: mongo-test
Database: mongo_test
Username: mongo_user
```

Shell:

```bash
docker ps | grep ldh-mongodb-mongo-test
docker logs ldh-mongodb-mongo-test --tail 30
```

Connection string format:

```txt
mongodb://mongo_user:PASSWORD@VM_IP:27017/mongo_test
```

## Lifecycle actions

For each instance test:

```txt
Stop
Start
Restart
Delete container
```

Expected:

```txt
Stop → instance STOPPED
Start → instance RUNNING
Restart → instance RUNNING
Delete container → instance DELETED, volume preserved
```

## Safety test

The worker must refuse deleting unmanaged containers.

Create unmanaged container:

```bash
docker run -d --name unmanaged-nginx nginx:alpine
```

LocalDB Hub should not touch it.

Cleanup manually:

```bash
docker rm -f unmanaged-nginx
```
