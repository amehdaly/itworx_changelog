#!/usr/bin/env bash
set -euo pipefail

if ! command -v monolith >/dev/null 2>&1; then
  cat >&2 <<'EOF'
Error: monolith is not installed or is not available on PATH.

Install it with one of these commands:
  cargo install monolith       # Cargo (cross-platform)
  brew install monolith        # Homebrew
  pacman -S monolith           # Arch Linux

More installation options: https://github.com/Y2Z/monolith#installation
EOF
  exit 1
fi

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
input="$script_dir/bss_export/changelog.html"
output="$script_dir/changelog.html"

if [[ ! -f "$input" ]]; then
  printf 'Error: %s not found\n' "$input" >&2
  exit 1
fi

temp_file="$(mktemp "$script_dir/.changelog.html.XXXXXX")"
trap 'rm -f -- "$temp_file"' EXIT

monolith --quiet --output "$temp_file" "$input"
chmod --reference="$output" "$temp_file"
mv -f -- "$temp_file" "$output"
