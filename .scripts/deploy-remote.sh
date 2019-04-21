#!/usr/bin/env bash
set -euo pipefail

prod_host="chuck"
prod_branch="master"

echo
echo "Checking environment..."

current_host=$(hostname)
if [[ "$current_host" = "$prod_host" ]]; then
    echo " - OK: Host is '$prod_host'"
else
    echo " - ERROR: Host is '$current_host', not '$prod_host'"
    exit 1
fi

current_branch=$(git rev-parse --abbrev-ref HEAD)
if [[ "$current_branch" == "$prod_branch" ]]; then
    echo " - OK: Checked out branch is '$prod_branch'"
else
    echo " - ERROR: Checked out branch is '$current_branch', not '$prod_branch'"
    exit 1
fi

if [[ -z "$(git status --porcelain)" ]]; then
    echo " - OK: Git environment is clean"
else
    echo " - ERROR: Git environment is not clean"
    exit 1
fi

if git describe --exact-match HEAD > /dev/null 2>&1; then
    echo " - OK: We're on tag $(git describe --exact-match HEAD)"
else
    echo " - ERROR: The HEAD of master is not a tagged commit"
    exit 1
fi

echo
echo "Rebuilding images..."
docker-compose build

echo
echo "Starting containers..."
docker-compose up -d
