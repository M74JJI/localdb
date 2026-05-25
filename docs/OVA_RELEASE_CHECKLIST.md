# OVA Release Checklist

## Before exporting

Run:

```bash
sudo systemctl status localdb-hub
cd /opt/localdb-hub/app
deploy/scripts/compose-logs.sh
deploy/scripts/diagnostics.sh
```

## Validate web flow

Open:

```txt
http://VM_IP:8080
```

Check:

```txt
/setup loads
first admin can be created
login works
/dashboard loads
/system shows metadata DB ok
/system shows master key ok
/system shows Docker ok
```

## Validate database flow

Create:

```txt
SQLite
PostgreSQL
Redis
MongoDB
```

Expected:

```txt
SQLite RUNNING
PostgreSQL RUNNING
Redis RUNNING
MongoDB RUNNING
Jobs SUCCEEDED
Docker containers visible
```

## Validate backup flow

```txt
SQLite backup succeeds
PostgreSQL backup succeeds
MongoDB backup succeeds
Redis backup succeeds
```

## Clean before release

Remove test containers if desired:

```bash
docker ps -a --filter "label=com.localdbhub.managed=true"
```

Remove test DB data if releasing a clean VM:

```bash
sudo systemctl stop localdb-hub
sudo rm -rf /opt/localdb-hub/metadata/*
sudo rm -rf /opt/localdb-hub/data/*
sudo rm -rf /opt/localdb-hub/backups/*
sudo rm -rf /opt/localdb-hub/logs/*
sudo rm -rf /opt/localdb-hub/jobs/*
sudo systemctl start localdb-hub
```

Do **not** remove:

```txt
/opt/localdb-hub/config/master.key
```

unless you want the first boot to regenerate it.

## Security cleanup

```bash
history -c
sudo journalctl --rotate
sudo journalctl --vacuum-time=1s
```

Ensure OS default password policy is documented.

## Export

VirtualBox:

```txt
File → Export Appliance
```

or CLI:

```bash
VBoxManage export "localdb-hub-debian12" -o localdb-hub-debian12.ova
```
