#!/usr/bin/env bash
set -euo pipefail

INSTALL_ROOT="/opt/localdb-hub"
APP_DIR="$INSTALL_ROOT/app"

echo "[LocalDB Hub Uninstaller] Stopping service..."
sudo systemctl stop localdb-hub || true
sudo systemctl disable localdb-hub || true
sudo rm -f /etc/systemd/system/localdb-hub.service
sudo systemctl daemon-reload || true

if [ -d "$APP_DIR" ]; then
  echo "[LocalDB Hub Uninstaller] Stopping Compose stack..."
  cd "$APP_DIR"
  docker compose --env-file deploy/compose/.env -f deploy/compose/docker-compose.yml down || true
fi

echo ""
echo "Runtime data was NOT removed:"
echo "  $INSTALL_ROOT"
echo ""
echo "To remove all data/backups/secrets manually:"
echo "  sudo rm -rf $INSTALL_ROOT"
echo ""
