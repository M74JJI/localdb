# Linux / Debian / Ubuntu VM Validation

## Goal

Validate LocalDB Hub in the environment where it will actually control Docker containers.

Windows is fine for coding, but Docker socket lifecycle must be tested on Linux.

## Recommended VM

Use:

```txt
Debian 12
or Ubuntu Server 24.04 LTS
2+ CPU
6GB+ RAM recommended
40GB+ disk
Bridged networking if you want to access databases from your Windows host
```

## 1. Install base dependencies

```bash
sudo apt update
sudo apt install -y curl git unzip openssl ca-certificates
```

## 2. Install Docker Engine

Use Docker's official install path or your preferred secure method.

Minimal quick test after install:

```bash
docker --version
docker info
```

If your user cannot access Docker:

```bash
sudo usermod -aG docker $USER
newgrp docker
docker info
```

## 3. Install Bun

```bash
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc
bun --version
```

## 4. Copy project to VM

Example from Windows host:

```bash
scp -r localdb-hub-foundation user@VM_IP:/home/user/localdb-hub
```

Or use Git once the repo is pushed.

## 5. Prepare environment

From project root on VM:

```bash
cp deploy/env/linux-vm.env.example .env
```

Edit `.env` and replace:

```txt
LOCAL_VM_IP
```

with your VM IP.

Find VM IP:

```bash
ip addr
hostname -I
```

## 6. Prepare runtime folders

```bash
chmod +x deploy/scripts/*.sh
source .env
deploy/scripts/prepare-linux-runtime.sh
deploy/scripts/check-docker-ready.sh
```

## 7. Install and prepare app

```bash
bun install
bun run setup:dev
bun run db:generate
bun run db:push
```

Important: `setup:dev` may create local `./storage` folders too. For the VM production-style path, the real target is `/opt/localdb-hub`.

## 8. Start services

Terminal 1:

```bash
source .env
bun run dev:api
```

Terminal 2:

```bash
source .env
bun run dev:web
```

Terminal 3:

```bash
source .env
bun run dev:worker
```

## 9. Open UI

From Windows host browser:

```txt
http://VM_IP:3000
```

Then:

```txt
/setup
/login
/dashboard
/system
```

## 10. Validate Docker state

Open:

```txt
http://VM_IP:3000/system
```

Expected:

```txt
Docker: ok:<version>
Metadata DB: ok
Master key: ok
```

## 11. Create real containers

Create:

```txt
PostgreSQL
Redis
MongoDB
```

Expected:

```txt
Job: SUCCEEDED
Instance: RUNNING
Docker container visible
Connection string uses VM IP or localhost depending expose mode
```

## 12. Verify from shell

```bash
docker ps --filter "label=com.localdbhub.managed=true"
docker volume ls --filter "label=com.localdbhub.managed=true"
docker network inspect localdb-hub-net
```

## 13. Run diagnostics

```bash
source .env
deploy/scripts/diagnostics.sh
```
