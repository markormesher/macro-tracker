#!/usr/bin/env bash
set -euo pipefail

script_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

temp_file=$(mktemp)
cat "${script_dir}/../package.json" | sed 's/"version": ".*"/"version": "0.0.0"/' > "${temp_file}"

if diff "${script_dir}/../package.json-versionless" "${temp_file}" > /dev/null 2>&1; then
  echo "OK: versionless package.json is up to date"
else
  echo "ERROR: versionless package.json is out of date"
  exit 1
fi
