#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
COMPOSE_FILE="$ROOT_DIR/deploy/compose/docker-compose.yml"
ENV_FILE="$ROOT_DIR/deploy/compose/.env"

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing $ENV_FILE"
  echo "Copy deploy/compose/.env.production.example to deploy/compose/.env and edit it."
  exit 1
fi

cd "$ROOT_DIR"

echo "[LocalDB Hub] Starting Compose appliance..."
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d --build

echo ""
echo "LocalDB Hub is starting."
echo "Open: http://<VM_IP>:$(grep -E '^PUBLIC_PORT=' "$ENV_FILE" | cut -d= -f2 || echo 8080)"
