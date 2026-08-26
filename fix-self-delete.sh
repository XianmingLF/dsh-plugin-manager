#!/usr/bin/env bash
# One-click recovery (English). Stop dsh web first, then run this script.
cd "$(dirname "$0")"
node fix-self-delete.mjs --lang en "$@"
echo
echo "Done. You can now start dsh web."
printf "Press Enter to close... "
read -r _
