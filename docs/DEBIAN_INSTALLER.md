# Debian / Ubuntu Installer

## Goal

Install LocalDB Hub as a self-hosted appliance on a Debian/Ubuntu VM or server.

## What the installer does

- validates OS
- installs base packages
- installs Docker Engine using distro packages
- installs Docker Compose plugin
- installs Bun if missing
- creates `/opt/localdb-hub`
- creates `/opt/localdb-hub/config/master.key`
- copies app files into `/opt/localdb-hub/app`
- creates production Compose `.env`
- detects VM/server IP
- installs systemd service
- builds and starts the Compose appliance

## Install

From the project root:

```bash
chmod +x deploy/scripts/*.sh
deploy/scripts/install-debian.sh
```

Then open:

```txt
http://VM_IP:8080
```

## Service commands

```bash
sudo systemctl status localdb-hub
sudo systemctl restart localdb-hub
sudo systemctl stop localdb-hub
```

## Logs

```bash
cd /opt/localdb-hub/app
deploy/scripts/compose-logs.sh
```

## Upgrade

From a newer project root:

```bash
chmod +x deploy/scripts/*.sh
deploy/scripts/upgrade-debian.sh
```

## Uninstall

```bash
cd /opt/localdb-hub/app
deploy/scripts/uninstall-debian.sh
```

The uninstaller does **not** delete runtime data by default.

To manually delete everything:

```bash
sudo rm -rf /opt/localdb-hub
```

## Important security notes

- `/opt/localdb-hub/config/master.key` protects encrypted instance secrets.
- Losing the master key means losing access to encrypted credentials.
- Only the worker container mounts `/var/run/docker.sock`.
- The dashboard should not be exposed publicly without firewall/HTTPS hardening.
