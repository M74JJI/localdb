# Architecture

## Service boundaries

```txt
Browser
  ↓
Caddy reverse proxy
  ↓
Next.js web dashboard
  ↓
Fastify API control plane
  ↓
SQLite job queue
  ↓
Worker engine
  ↓
Docker Engine
  ↓
Database containers
```

## Hard rules

- The frontend never touches Docker.
- The API does not run heavy Docker jobs directly.
- The worker is the only service that mounts `/var/run/docker.sock`.
- Runtime storage lives under `/opt/localdb-hub`.
- Database engines are templates; they are not all running by default.
- Admin tools are optional/on-demand, not mandatory base services.

## Core services

### Web

Next.js 16+ dashboard.

### API

Fastify control plane for auth, templates, instances, jobs, backups, audit logs, and system health.

### Worker

Executes Docker and backup/restore jobs.

### Metadata DB

SQLite with Prisma.

### Proxy

Caddy exposes one clean URL.
