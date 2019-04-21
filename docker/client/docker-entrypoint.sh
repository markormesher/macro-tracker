#!/usr/bin/env bash
set -euo pipefail

./node_modules/.bin/wait-for-it api:3000 --timeout=30 --strict &

wait

exec "$@"
