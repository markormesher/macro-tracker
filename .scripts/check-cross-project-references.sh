#!/usr/bin/env bash
set -euo pipefail

if [[ ! -d ./src ]]; then
    echo "Must be executed from project root"
    exit 1
fi

EXIT_CODE=0

# does ./src/api reference ./src/client?
if grep -r -F "../client/" ./src/api >/dev/null; then
    echo "ERROR: code in ./src/client is referenced by the following files:"
    grep -r -F -l "../client/" ./src/api
    EXIT_CODE=1
fi

# does ./src/client reference ./src/api?
if grep -r -F "../api/" ./src/client >/dev/null; then
    echo "ERROR: code in ./src/api is referenced by the following files:"
    grep -r -F -l "../api/" ./src/client
    EXIT_CODE=1
fi

# does ./src/commons reference ./src/api?
if grep -r -F "../api/" ./src/commons >/dev/null; then
    echo "ERROR: code in ./src/api is referenced by the following files:"
    grep -r -F -l "../api/" ./src/commons
    EXIT_CODE=1
fi

# does ./src/commons reference ./src/client?
if grep -r -F "../client/" ./src/commons >/dev/null; then
    echo "ERROR: code in ./src/client is referenced by the following files:"
    grep -r -F -l "../client/" ./src/commons
    EXIT_CODE=1
fi

if [[ ${EXIT_CODE} == 0 ]]; then
    echo "OK: project cross-references are all okay"
fi

exit ${EXIT_CODE}
