#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
input="$script_dir/changelog.html"

if [[ ! -f "$input" ]]; then
  printf 'Error: %s not found\n' "$input" >&2
  exit 1
fi

temp_file="$(mktemp "$script_dir/.changelog.html.XXXXXX")"
trap 'rm -f -- "$temp_file"' EXIT

monolith --quiet --output "$temp_file" "$input"
chmod --reference="$input" "$temp_file"
mv -f -- "$temp_file" "$input"
