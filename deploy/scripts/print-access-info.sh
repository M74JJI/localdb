#!/usr/bin/env bash
set -euo pipefail

ENV_FILE="${1:-/opt/localdb-hub/app/deploy/compose/.env}"

HOST="$(hostname -I 2>/dev/null | awk '{print $1}')"
PORT="8080"

if [ -f "$ENV_FILE" ]; then
  PORT="$(grep -E '^PUBLIC_PORT=' "$ENV_FILE" | tail -n1 | cut -d= -f2 || true)"
  [ -z "$PORT" ] && PORT="8080"
fi

echo ""
echo "======================================"
echo " LocalDB Hub"
echo "======================================"
echo ""
echo "Open:"
echo "  http://$HOST:$PORT"
echo ""
echo "Useful commands:"
echo "  sudo systemctl status localdb-hub"
echo "  sudo systemctl restart localdb-hub"
echo "  cd /opt/localdb-hub/app && deploy/scripts/compose-logs.sh"
echo ""
echo "Runtime:"
echo "  /opt/localdb-hub"
echo ""
