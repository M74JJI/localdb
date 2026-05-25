#!/usr/bin/env bash
set -euo pipefail

echo "[Packer] Installing LocalDB Hub appliance"

SRC="/tmp/localdb-hub-src"
TARGET="/opt/localdb-hub/app"

if [ ! -d "$SRC" ]; then
  echo "Missing source directory: $SRC" >&2
  exit 1
fi

apt-get update
apt-get install -y sudo curl git unzip openssl ca-certificates docker.io docker-compose-plugin rsync

systemctl enable docker
systemctl start docker

if ! id localdb >/dev/null 2>&1; then
  useradd -m -s /bin/bash localdb
  echo "localdb:localdb" | chpasswd
  usermod -aG sudo,docker localdb
fi

mkdir -p /opt/localdb-hub/config /opt/localdb-hub/metadata /opt/localdb-hub/data /opt/localdb-hub/backups /opt/localdb-hub/logs /opt/localdb-hub/jobs /opt/localdb-hub/tmp
chown -R localdb:localdb /opt/localdb-hub

if [ ! -f /opt/localdb-hub/config/master.key ]; then
  openssl rand -base64 32 > /opt/localdb-hub/config/master.key
  chmod 600 /opt/localdb-hub/config/master.key
  chown localdb:localdb /opt/localdb-hub/config/master.key
fi

mkdir -p "$TARGET"
rsync -a --delete   --exclude node_modules   --exclude .next   --exclude dist   --exclude storage   --exclude .git   "$SRC/" "$TARGET/"

chown -R localdb:localdb /opt/localdb-hub/app

# Install Bun for localdb user.
sudo -u localdb bash -lc 'curl -fsSL https://bun.sh/install | bash'

# Prepare env.
HOST_IP="$(hostname -I | awk '{print $1}')"
cp "$TARGET/deploy/compose/.env.production.example" "$TARGET/deploy/compose/.env"
sed -i "s/LOCAL_VM_IP/${HOST_IP}/g" "$TARGET/deploy/compose/.env"

# Install dependencies and initialize DB.
sudo -u localdb bash -lc "cd '$TARGET' && export PATH="\$HOME/.bun/bin:\$PATH" && bun install && bun run db:generate && source deploy/compose/.env && bun run db:push"

# Install systemd service.
cp "$TARGET/deploy/systemd/localdb-hub.service" /etc/systemd/system/localdb-hub.service
systemctl daemon-reload
systemctl enable localdb-hub

# First boot can start service automatically.
systemctl start localdb-hub || true

echo "[Packer] LocalDB Hub appliance installation complete"
