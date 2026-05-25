#!/usr/bin/env bash
set -euo pipefail

IP="$(hostname -I 2>/dev/null | awk '{print $1}')"
PORT="8080"

if [ -f /opt/localdb-hub/app/deploy/compose/.env ]; then
  PORT="$(grep -E '^PUBLIC_PORT=' /opt/localdb-hub/app/deploy/compose/.env | tail -n1 | cut -d= -f2 || true)"
  [ -z "$PORT" ] && PORT="8080"
fi

cat <<EOF

============================================================
 LocalDB Hub Appliance
============================================================

Open the web dashboard from your host machine:

  http://$IP:$PORT

First run:

  1. Open the URL above
  2. Create the first admin account
  3. Login
  4. Create databases from the dashboard

Useful commands:

  sudo systemctl status localdb-hub
  sudo systemctl restart localdb-hub
  cd /opt/localdb-hub/app && deploy/scripts/compose-logs.sh

Runtime data:

  /opt/localdb-hub

============================================================

EOF
