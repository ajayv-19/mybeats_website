#!/bin/bash
# Clean reinstall: remove node_modules, clear cache, install, start.
# If you get EACCES errors, run ./fix-amplify-permissions.sh first (once).

set -e
cd "$(dirname "$0")"

echo "Removing node_modules..."
rm -rf node_modules

echo "Clearing npm cache..."
npm cache clean --force

echo "Installing dependencies..."
npm install

echo "Starting app..."
npm run start
