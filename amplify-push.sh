#!/bin/bash
# Use this if "amplify push" fails with yarn/version errors (e.g. Hadoop YARN in PATH).
# This script puts Node's bin first so Amplify uses npm (or Node's yarn if installed).

NODE_BIN="$(dirname "$(which node)")"
export PATH="$NODE_BIN:$PATH"
echo "Using PATH: $PATH"
exec amplify push "$@"
