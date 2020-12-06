#!/usr/bin/env bash
set -euo pipefail

script_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

cat "${script_dir}/../package.json" | sed 's/"version": ".*"/"version": "0.0.0"/' > "${script_dir}/../package.json-versionless"
