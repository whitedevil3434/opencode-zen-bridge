#!/bin/sh
set -e

echo "=== Starting OpenCode Zen Bridge ==="

OPENCODE_DIR="$HOME/.local/share/opencode"
CONFIG_DIR="$HOME/.config/opencode"

mkdir -p "$OPENCODE_DIR"
mkdir -p "$CONFIG_DIR"

# 1. Inject Auth if provided via Base64 or raw JSON
if [ -n "$OPENCODE_AUTH_B64" ]; then
  echo "[Entrypoint] Decoding and injecting OPENCODE_AUTH_B64 into $OPENCODE_DIR/auth.json..."
  echo "$OPENCODE_AUTH_B64" | base64 -d > "$OPENCODE_DIR/auth.json"
  chmod 600 "$OPENCODE_DIR/auth.json"
elif [ -n "$OPENCODE_AUTH_JSON" ]; then
  echo "[Entrypoint] Injecting OPENCODE_AUTH_JSON into $OPENCODE_DIR/auth.json..."
  echo "$OPENCODE_AUTH_JSON" > "$OPENCODE_DIR/auth.json"
  chmod 600 "$OPENCODE_DIR/auth.json"
fi

# 2. Inject Config if provided
if [ -n "$OPENCODE_CONFIG_JSON" ]; then
  echo "[Entrypoint] Injecting OPENCODE_CONFIG_JSON into $CONFIG_DIR/opencode.json..."
  echo "$OPENCODE_CONFIG_JSON" > "$CONFIG_DIR/opencode.json"
fi

if [ -f "$OPENCODE_DIR/auth.json" ]; then
  echo "[Entrypoint] Auth file verified ($(wc -c < "$OPENCODE_DIR/auth.json") bytes)."
else
  echo "[Entrypoint] WARNING: No auth.json detected! Provide OPENCODE_AUTH_B64 env variable."
fi

# Verify OpenCode installation
echo "[Entrypoint] OpenCode CLI version: $(opencode --version 2>/dev/null || echo 'not installed')"

# 3. Exec server
exec node server.mjs
