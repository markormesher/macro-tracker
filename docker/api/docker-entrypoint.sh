#!/usr/bin/env bash
set -euo pipefail

./node_modules/.bin/wait-for-it postgres_master:5432 --timeout=30 --strict &
./node_modules/.bin/wait-for-it postgres_slave_1:5432 --timeout=30 --strict &
./node_modules/.bin/wait-for-it postgres_slave_2:5432 --timeout=30 --strict &
./node_modules/.bin/wait-for-it redis:6379 --timeout=30 --strict &

wait

exec "$@"
