#!/usr/bin/env bash
set -euo pipefail

script_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
source "${script_dir}/remote-settings.sh"

remote_container=$(ssh "${REMOTE_USER}"@"${REMOTE_HOST}" "docker ps --format \"{{.Names}}\" | grep macros | grep postgres | grep primary")
local_container=$(docker ps --format "{{.Names}}" | grep macros | grep postgres | grep primary)

if [[ -z "${remote_container}" ]]; then
  echo "Couldn't find remote container"
  exit 1
fi

if [[ -z "${local_container}" ]]; then
  echo "Couldn't find local container"
  exit 1
fi

ssh "${REMOTE_USER}"@"${REMOTE_HOST}" "docker exec -t ${remote_container} pg_dump -c -U macro_tracker macro_tracker" | docker exec -i "${local_container}" psql -U macro_tracker
