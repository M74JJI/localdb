# Phase 3 — Worker Queue

## Goal

Make the worker process queued jobs before adding real Docker lifecycle.

## Behavior

- Worker claims queued jobs.
- Worker writes job logs.
- Worker marks SQLite creation as complete.
- Worker marks Docker database creation as `WAITING_DOCKER` if Docker is disabled/unavailable.

## Why this matters

This gives us the correct asynchronous architecture:

```txt
Web → API → Job row → Worker → status/log updates
```

Instead of making the API perform long-running Docker work.

## Windows dev

Keep:

```env
LOCALDB_HUB_DOCKER_ENABLED=false
```

SQLite can be tested end-to-end. PostgreSQL/MySQL/MongoDB/Redis will wait for the Debian/Ubuntu Docker environment.
