#!/usr/bin/env bash
set -euo pipefail

echo "[LocalDB Hub] Docker readiness check"

if ! command -v docker >/dev/null 2>&1; then
  echo "ERROR: docker command not found"
  echo "Install Docker Engine first."
  exit 1
fi

echo "Docker binary: $(command -v docker)"
docker --version

if [ ! -S /var/run/docker.sock ]; then
  echo "ERROR: /var/run/docker.sock does not exist or is not a socket"
  exit 1
fi

echo "Docker socket exists: /var/run/docker.sock"

if docker info >/tmp/localdbhub-docker-info.txt 2>&1; then
  echo "Docker daemon reachable."
else
  echo "ERROR: Docker daemon is not reachable by current user."
  cat /tmp/localdbhub-docker-info.txt
  echo ""
  echo "Try one of:"
  echo "  sudo usermod -aG docker $USER"
  echo "  newgrp docker"
  echo "  or run the worker as a user with Docker socket access."
  exit 1
fi

docker network inspect localdb-hub-net >/dev/null 2>&1 && echo "Network localdb-hub-net exists." || echo "Network localdb-hub-net will be created by the worker."

echo "Docker readiness check complete."
