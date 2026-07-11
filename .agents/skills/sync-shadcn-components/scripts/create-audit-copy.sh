#!/usr/bin/env bash

set -euo pipefail

project_root="${1:-$PWD}"

if [[ ! -f "$project_root/components.json" ]]; then
  echo "components.json was not found in: $project_root" >&2
  exit 1
fi

project_root="$(cd "$project_root" && pwd -P)"
audit_root="$(mktemp -d "${TMPDIR:-/tmp}/sync-shadcn-components.XXXXXX")"

cleanup_on_error() {
  rm -rf "$audit_root"
}

trap cleanup_on_error ERR INT TERM

rsync -a \
  --exclude='.git/' \
  --exclude='node_modules/' \
  --exclude='.next/' \
  --exclude='.turbo/' \
  --exclude='dist/' \
  --exclude='build/' \
  --exclude='coverage/' \
  --exclude='.cache/' \
  "$project_root/" "$audit_root/"

trap - ERR INT TERM
printf '%s\n' "$audit_root"
