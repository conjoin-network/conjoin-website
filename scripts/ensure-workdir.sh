#!/usr/bin/env bash
set -euo pipefail

EXPECTED="/Users/msleox/Documents/conjoin/web"
CURRENT="$(pwd -P)"

if [[ "${CURRENT}" != "${EXPECTED}" ]]; then
  echo "ERROR: invalid working directory"
  echo "Expected: ${EXPECTED}"
  echo "Current:  ${CURRENT}"
  exit 1
fi
