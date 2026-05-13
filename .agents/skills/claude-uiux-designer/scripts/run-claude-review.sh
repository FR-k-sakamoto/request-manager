#!/usr/bin/env bash

set -euo pipefail

if [[ $# -gt 0 ]]; then
  prompt="$1"
elif [[ ! -t 0 ]]; then
  prompt="$(cat)"
else
  echo "Usage: run-claude-review.sh '<prompt>' or pipe the prompt on stdin." >&2
  exit 1
fi

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

printf '%s' "$prompt" | node "$script_dir/run-claude-review.mjs"
