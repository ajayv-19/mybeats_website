#!/bin/bash
# Fix ownership of dirs that were created or touched by sudo (amplify push, npm, etc.).
# Run once: ./fix-amplify-permissions.sh (will ask for sudo password)

set -e
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
ME="$(whoami):$(id -gn)"

echo "Fixing ownership..."
echo "  1. $PROJECT_DIR/amplify"
sudo chown -R "$ME" "$PROJECT_DIR/amplify"
echo "  2. ~/.amplify"
sudo chown -R "$ME" "$HOME/.amplify" 2>/dev/null || true
echo "  3. ~/.npm (npm cache)"
sudo chown -R "$ME" "$HOME/.npm" 2>/dev/null || true
echo "Done. You can now run: npm install && npm run start (and ./amplify-push.sh when needed)"
