#!/usr/bin/env bash
set -euo pipefail

INSTALL_ROOT="/opt/localdb-hub"
APP_DIR="$INSTALL_ROOT/app"

fail() {
  echo "[LocalDB Hub Upgrade] ERROR: $*" >&2
  exit 1
}

[ -f "package.json" ] || fail "Run this script from the new LocalDB Hub project root."

echo "[LocalDB Hub Upgrade] Stopping service..."
sudo systemctl stop localdb-hub || true

echo "[LocalDB Hub Upgrade] Backing up current app directory..."
if [ -d "$APP_DIR" ]; then
  TS="$(date +%Y%m%d-%H%M%S)"
  cp -a "$APP_DIR" "$INSTALL_ROOT/app-backup-$TS"
  echo "Backup: $INSTALL_ROOT/app-backup-$TS"
fi

echo "[LocalDB Hub Upgrade] Syncing new app files..."
mkdir -p "$APP_DIR"
rsync -a --delete   --exclude node_modules   --exclude .next   --exclude dist   --exclude storage   --exclude .git   ./ "$APP_DIR/"

cd "$APP_DIR"

if [ ! -f deploy/compose/.env ]; then
  echo "[LocalDB Hub Upgrade] Missing deploy/compose/.env. Creating from example."
  cp deploy/compose/.env.production.example deploy/compose/.env
fi

echo "[LocalDB Hub Upgrade] Installing dependencies..."
bun install

echo "[LocalDB Hub Upgrade] Generating Prisma client..."
bun run db:generate

echo "[LocalDB Hub Upgrade] Applying DB schema..."
source deploy/compose/.env
bun run db:push

echo "[LocalDB Hub Upgrade] Rebuilding Compose images..."
deploy/scripts/compose-rebuild.sh

echo "[LocalDB Hub Upgrade] Starting service..."
sudo systemctl start localdb-hub

deploy/scripts/print-access-info.sh deploy/compose/.env
