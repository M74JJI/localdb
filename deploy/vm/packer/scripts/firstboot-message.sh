#!/usr/bin/env bash
set -euo pipefail

cat >/etc/profile.d/localdb-hub.sh <<'EOF'
#!/usr/bin/env bash
if [ -x /opt/localdb-hub/app/deploy/scripts/firstboot-info.sh ]; then
  /opt/localdb-hub/app/deploy/scripts/firstboot-info.sh
fi
EOF

chmod +x /etc/profile.d/localdb-hub.sh

cat >/etc/motd <<'EOF'
LocalDB Hub Appliance

Login and run:

  /opt/localdb-hub/app/deploy/scripts/firstboot-info.sh

EOF
