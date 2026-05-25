#!/usr/bin/env bash
set -euo pipefail

APP_NAME="localdb-hub"
INSTALL_ROOT="/opt/localdb-hub"
APP_DIR="$INSTALL_ROOT/app"
SERVICE_FILE="/etc/systemd/system/localdb-hub.service"

log() {
  echo "[LocalDB Hub Installer] $*"
}

fail() {
  echo "[LocalDB Hub Installer] ERROR: $*" >&2
  exit 1
}

require_linux() {
  [ -f /etc/os-release ] || fail "This installer requires Debian/Ubuntu Linux."

  . /etc/os-release

  case "${ID:-}" in
    debian|ubuntu)
      log "Detected OS: ${PRETTY_NAME:-$ID}"
      ;;
    *)
      case "${ID_LIKE:-}" in
        *debian*)
          log "Detected Debian-like OS: ${PRETTY_NAME:-$ID}"
          ;;
        *)
          fail "Unsupported OS: ${PRETTY_NAME:-unknown}. Use Debian/Ubuntu."
          ;;
      esac
      ;;
  esac
}

require_project_root() {
  [ -f "package.json" ] || fail "Run this script from the LocalDB Hub project root."
  [ -f "deploy/compose/docker-compose.yml" ] || fail "Missing deploy/compose/docker-compose.yml"
}

install_packages() {
  log "Installing base packages..."
  sudo apt update
  sudo apt install -y ca-certificates curl git unzip openssl rsync bash docker.io docker-compose-plugin
}

ensure_docker() {
  if ! command -v docker >/dev/null 2>&1; then
    fail "Docker was not installed successfully."
  fi

  sudo systemctl enable docker
  sudo systemctl start docker

  if ! docker info >/dev/null 2>&1; then
    log "Current user cannot access Docker directly. Adding user to docker group."
    sudo usermod -aG docker "$USER" || true
    log "Docker group updated. You may need to logout/login or run: newgrp docker"
  fi
}

ensure_bun() {
  if command -v bun >/dev/null 2>&1; then
    log "Bun already installed: $(bun --version)"
    return
  fi

  log "Installing Bun for current user..."
  curl -fsSL https://bun.sh/install | bash

  export BUN_INSTALL="$HOME/.bun"
  export PATH="$BUN_INSTALL/bin:$PATH"

  command -v bun >/dev/null 2>&1 || fail "Bun install did not finish correctly. Open a new shell and rerun installer."
}

detect_ip() {
  hostname -I 2>/dev/null | awk '{print $1}'
}

prepare_runtime() {
  log "Preparing runtime folders under $INSTALL_ROOT"
  sudo mkdir -p "$INSTALL_ROOT/config" "$INSTALL_ROOT/metadata" "$INSTALL_ROOT/data" "$INSTALL_ROOT/backups" "$INSTALL_ROOT/logs" "$INSTALL_ROOT/jobs" "$INSTALL_ROOT/tmp"
  sudo chown -R "$USER":"$USER" "$INSTALL_ROOT"

  local key="$INSTALL_ROOT/config/master.key"

  if [ ! -f "$key" ]; then
    openssl rand -base64 32 > "$key"
    chmod 600 "$key"
    log "Created master key: $key"
  else
    log "Master key already exists: $key"
  fi
}

copy_app() {
  log "Copying project to $APP_DIR"
  mkdir -p "$APP_DIR"

  rsync -a --delete     --exclude node_modules     --exclude .next     --exclude dist     --exclude storage     --exclude .git     ./ "$APP_DIR/"
}

write_env() {
  local ip
  ip="$(detect_ip)"
  [ -n "$ip" ] || ip="127.0.0.1"

  log "Detected host IP: $ip"

  local env_file="$APP_DIR/deploy/compose/.env"

  cp "$APP_DIR/deploy/compose/.env.production.example" "$env_file"
  sed -i "s/LOCAL_VM_IP/$ip/g" "$env_file"

  log "Wrote $env_file"
}

prepare_app() {
  log "Installing Bun dependencies in appliance app directory..."
  cd "$APP_DIR"
  bun install

  log "Generating Prisma client..."
  bun run db:generate

  log "Applying SQLite schema..."
  source "$APP_DIR/deploy/compose/.env"
  bun run db:push
}

install_service() {
  log "Installing systemd service..."
  sudo cp "$APP_DIR/deploy/systemd/localdb-hub.service" "$SERVICE_FILE"
  sudo systemctl daemon-reload
  sudo systemctl enable localdb-hub
}

start_app() {
  log "Building and starting LocalDB Hub Compose appliance..."
  cd "$APP_DIR"
  sudo systemctl restart localdb-hub
}

main() {
  require_linux
  require_project_root
  install_packages
  ensure_docker
  ensure_bun
  prepare_runtime
  copy_app
  write_env
  prepare_app
  install_service
  start_app

  "$APP_DIR/deploy/scripts/print-access-info.sh" "$APP_DIR/deploy/compose/.env"

  log "Install complete."
  log "If Docker group membership was just added, logout/login may be required for non-sudo Docker commands."
}

main "$@"
