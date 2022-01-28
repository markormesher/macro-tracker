#!/usr/bin/env bash
set -euo pipefail

script_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
packages_dir="${script_dir}/../private-packages"
rm -rf "${packages_dir}"
mkdir -p "${packages_dir}"
git clone -q "https://${PRIVATE_PACKAGE_REPO_TOKEN}@github.com/${PRIVATE_PACKAGE_REPO}.git" "${packages_dir}"

echo '*' > "${packages_dir}/.gitignore"
echo '!.gitkeep' >> "${packages_dir}/.gitignore"
touch "${packages_dir}/.gitkeep"
