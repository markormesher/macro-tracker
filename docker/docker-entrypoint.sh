#!/usr/bin/env bash
set -euo pipefail

./node_modules/.bin/wait-for-it postgres_primary:5432 --timeout=30 --strict &

wait

exec "$@"
