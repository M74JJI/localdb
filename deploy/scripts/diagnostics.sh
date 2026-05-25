#!/usr/bin/env bash
set -euo pipefail

echo "=============================="
echo " LocalDB Hub Diagnostics"
echo "=============================="

echo ""
echo "[System]"
uname -a || true
cat /etc/os-release || true

echo ""
echo "[User]"
whoami
id

echo ""
echo "[Runtime paths]"
ROOT="${LOCALDB_HUB_ROOT:-/opt/localdb-hub}"
echo "LOCALDB_HUB_ROOT=$ROOT"
for d in "$ROOT" "$ROOT/config" "$ROOT/metadata" "$ROOT/data" "$ROOT/backups" "$ROOT/logs" "$ROOT/jobs" "$ROOT/tmp"; do
  if [ -e "$d" ]; then
    ls -ld "$d"
  else
    echo "MISSING $d"
  fi
done

echo ""
echo "[Master key]"
KEY="${LOCALDB_HUB_MASTER_KEY_PATH:-$ROOT/config/master.key}"
if [ -f "$KEY" ]; then
  ls -l "$KEY"
  echo "Master key exists."
else
  echo "MISSING $KEY"
fi

echo ""
echo "[Docker]"
if command -v docker >/dev/null 2>&1; then
  docker --version || true
  docker info --format '{{json .ServerVersion}}' || true
  echo ""
  echo "LocalDB Hub containers:"
  docker ps -a --filter "label=com.localdbhub.managed=true" --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}' || true
  echo ""
  echo "LocalDB Hub volumes:"
  docker volume ls --filter "label=com.localdbhub.managed=true" || true
  echo ""
  echo "LocalDB Hub network:"
  docker network inspect localdb-hub-net >/dev/null 2>&1 && docker network inspect localdb-hub-net --format '{{json .Name}}' || echo "network not found"
else
  echo "docker not installed"
fi

echo ""
echo "[Ports]"
ss -lntp || netstat -lntp || true

echo ""
echo "Diagnostics complete."
