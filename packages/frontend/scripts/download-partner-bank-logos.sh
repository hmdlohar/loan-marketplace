#!/usr/bin/env bash
set -euo pipefail

# Downloads Indian bank SVG logos from Wikimedia Commons.
# Source: https://commons.wikimedia.org/wiki/Category:SVG_logos_of_banks_in_India

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUT_DIR="${SCRIPT_DIR}/../public/partner-banks"
BASE="https://commons.wikimedia.org/wiki/Special:FilePath"

mkdir -p "${OUT_DIR}"

download() {
  local out_name="$1"
  local wiki_file="$2"
  local dest="${OUT_DIR}/${out_name}.svg"
  if curl -fsSL "${BASE}/${wiki_file}" -o "${dest}"; then
    echo "Wrote ${out_name}.svg"
  else
    echo "Failed ${out_name}.svg" >&2
    return 1
  fi
  sleep 2
}

download sbi "State_Bank_of_India.svg"
download hdfc "HDFC_Bank_Logo.svg"
download icici "ICICI_Bank_Logo.svg"
download axis "Axis_Bank_logo.svg"
download pnb "Punjab_National_Bank.svg"
download canara "Canara_Bank_Logo.svg"
download union-bank "Union_Bank_of_India_Logo.svg"
download indusind "IndusInd_Bank_SVG_Logo.svg"
download yes-bank "Yes_Bank_SVG_Logo.svg"
download federal "Federal_bank_India.svg"
download rbl "RBL_Bank_SVG_Logo.svg"
download bandhan "Bandhan_Bank_Svg_Logo.svg"
download bom "Bank_of_Maharashtra_logo.svg"
download idfc "IDFC_Bank_Logo.svg" || true

echo "Done. Add new entries in config/partnerBanks.ts if you add files."
