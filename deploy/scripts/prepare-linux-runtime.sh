#!/usr/bin/env bash
set -euo pipefail

ROOT="${LOCALDB_HUB_ROOT:-/opt/localdb-hub}"
KEY="${LOCALDB_HUB_MASTER_KEY_PATH:-$ROOT/config/master.key}"

echo "[LocalDB Hub] Preparing runtime at $ROOT"

sudo mkdir -p "$ROOT/config" "$ROOT/metadata" "$ROOT/data" "$ROOT/backups" "$ROOT/logs" "$ROOT/jobs" "$ROOT/tmp"
sudo chown -R "$USER":"$USER" "$ROOT"

if [ ! -f "$KEY" ]; then
  mkdir -p "$(dirname "$KEY")"
  openssl rand -base64 32 > "$KEY"
  chmod 600 "$KEY"
  echo "Created master key: $KEY"
else
  echo "Master key already exists: $KEY"
fi

echo "Runtime prepared."
