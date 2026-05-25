# Installation Plan

## Mode 1: Docker Compose

Technical users run the platform with Docker Compose.

## Mode 2: Debian/Ubuntu installer

A script installs Docker, Caddy, LocalDB Hub files, systemd services, folders, and configuration.

## Mode 3: VM image

A Debian-based OVA image with LocalDB Hub preinstalled and first-run setup enabled.

## Runtime path

```txt
/opt/localdb-hub/
├── app/
├── config/
├── metadata/
├── data/
├── backups/
├── logs/
├── jobs/
└── tmp/
```
