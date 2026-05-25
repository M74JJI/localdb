# Compose Appliance Deployment

## Goal

Run LocalDB Hub as one appliance-style Docker Compose stack.

## Services

```txt
localdb-hub-caddy   → public reverse proxy
localdb-hub-web     → Next.js dashboard
localdb-hub-api     → Fastify control plane
localdb-hub-worker  → Docker/job executor
```

Only the worker mounts:

```txt
/var/run/docker.sock
```

This preserves the security boundary:

```txt
web → api → job row → worker → Docker
```

## Runtime storage

The platform stores state in:

```txt
/opt/localdb-hub/
├── config/master.key
├── metadata/localdb-hub.sqlite
├── data/
├── backups/
├── logs/
├── jobs/
└── tmp/
```

## Setup on Debian/Ubuntu

```bash
sudo apt update
sudo apt install -y docker.io docker-compose-plugin openssl git
sudo usermod -aG docker $USER
newgrp docker
```

From project root:

```bash
cp deploy/compose/.env.production.example deploy/compose/.env
```

Edit:

```txt
LOCAL_VM_IP
```

to your VM IP.

Then:

```bash
chmod +x deploy/scripts/*.sh
source deploy/compose/.env
deploy/scripts/prepare-linux-runtime.sh
deploy/scripts/check-docker-ready.sh
deploy/scripts/compose-up.sh
```

Open:

```txt
http://VM_IP:8080
```

## Logs

```bash
deploy/scripts/compose-logs.sh
```

## Stop

```bash
deploy/scripts/compose-down.sh
```

## Rebuild

```bash
deploy/scripts/compose-rebuild.sh
```

## Important

The platform itself runs in Compose. The databases created by LocalDB Hub are separate Docker containers created dynamically by the worker through the Docker API.
