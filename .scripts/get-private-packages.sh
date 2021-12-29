#!/usr/bin/env bash
set -euo pipefail

script_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
packages_dir="${script_dir}/../private-packages"
mkdir -p "$packages_dir"

tempdir=$(mktemp -d)
cd "$tempdir"
git clone git@github.com:markormesher/private-npm-packages.git
cp private-npm-packages/fortawesome-pro-light-svg-icons-5.14.0.tgz "${packages_dir}/."

rm -rf "$tempdir"
