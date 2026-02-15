#!/bin/bash
# Clean reinstall of node_modules for all Amplify Lambda functions.
# Run from project root: ./amplify/clean-install-functions.sh
# Or from amplify: ./clean-install-functions.sh

set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
FUNCTIONS_DIR="$SCRIPT_DIR/backend/function"

for func in user getcompanyofuser getQuickSightDashboardEmbedURL; do
  SRC="$FUNCTIONS_DIR/$func/src"
  if [ -f "$SRC/package.json" ]; then
    echo "--- $func ---"
    echo "  Removing node_modules..."
    rm -rf "$SRC/node_modules"
    echo "  npm install..."
    (cd "$SRC" && npm install)
    echo "  Done."
  fi
done

echo ""
echo "All Lambda function dependencies reinstalled. Run ./amplify-push.sh to deploy."
