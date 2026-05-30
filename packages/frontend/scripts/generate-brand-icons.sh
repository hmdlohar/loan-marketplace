#!/usr/bin/env bash
set -euo pipefail

# Keep in sync with APP_LOGO_STEM in packages/commonlib/src/brand.ts
STEM="logo"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BRAND_DIR="${SCRIPT_DIR}/../public/brand"
SOURCE="${BRAND_DIR}/${STEM}-source.png"

if [[ ! -f "${SOURCE}" ]]; then
  echo "Missing source logo: ${SOURCE}" >&2
  exit 1
fi

mkdir -p "${BRAND_DIR}"

for size in 32 64 128 192 512; do
  convert "${SOURCE}" -resize "${size}x${size}" "${BRAND_DIR}/${STEM}-${size}.png"
  echo "Wrote ${STEM}-${size}.png"
done

convert "${BRAND_DIR}/${STEM}-32.png" "${BRAND_DIR}/favicon.ico"
convert "${SOURCE}" -resize 180x180 "${BRAND_DIR}/apple-touch-icon.png"

echo "Wrote favicon.ico and apple-touch-icon.png"
