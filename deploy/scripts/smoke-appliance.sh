#!/usr/bin/env bash
set -euo pipefail
BASE_URL="${1:-http://localhost:8080}"
echo "[LocalDB Hub Smoke] Testing $BASE_URL"
check_status() {
  local path="$1" expected="$2" status
  status="$(curl -s -o /tmp/localdbhub-smoke-response.txt -w '%{http_code}' "$BASE_URL$path")"
  if [ "$status" != "$expected" ]; then
    echo "FAIL $path expected $expected got $status"
    cat /tmp/localdbhub-smoke-response.txt
    exit 1
  fi
  echo "OK $path -> $status"
}
check_status "/health" "200"
check_status "/api/system/health" "200"
check_status "/api/setup/status" "200"
check_status "/api/instances" "401"
echo ""
echo "[LocalDB Hub Smoke] PASS"
