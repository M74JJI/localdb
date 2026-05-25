# VM Image Builder

## Goal

Produce a ready LocalDB Hub VM image that users can import into VirtualBox, VMware, Proxmox, or similar platforms.

## Recommended release target

```txt
Debian 12
2 vCPU
4GB RAM minimum
40GB disk minimum
Bridged or NAT network
LocalDB Hub installed under /opt/localdb-hub
Dashboard exposed on http://VM_IP:8080
```

## Image build options

### Option A — Manual golden VM

1. Create Debian/Ubuntu VM manually.
2. Copy project to VM.
3. Run:

```bash
chmod +x deploy/scripts/*.sh
deploy/scripts/install-debian.sh
```

4. Clean shell history.
5. Shut down VM.
6. Export as OVA.

This is the fastest first release path.

### Option B — Packer VirtualBox image

Use the scaffold:

```txt
deploy/vm/packer/debian12-localdb-hub.pkr.hcl
```

Install Packer and VirtualBox, then:

```bash
cd deploy/vm/packer
packer init .
packer validate .
packer build   -var 'iso_url=file:///absolute/path/to/debian-12-netinst.iso'   -var 'iso_checksum=sha256:<actual_sha256>'   .
```

The current Packer template is a scaffold. The Debian boot command may need adjustment for the exact ISO.

### Option C — Cloud-init base image

Use:

```txt
deploy/vm/cloud-init/user-data
deploy/vm/cloud-init/meta-data
```

This is useful for Proxmox/cloud images.

## First boot

The VM should show access info through:

```bash
/opt/localdb-hub/app/deploy/scripts/firstboot-info.sh
```

Expected output:

```txt
http://VM_IP:8080
```

## Default credentials

There should be no default web admin account.

The user creates the first admin account from:

```txt
http://VM_IP:8080/setup
```

The Linux VM user may temporarily be:

```txt
localdb / localdb
```

For release, force password change or document clearly that the OS password must be changed.
