#!/bin/sh
set -e

echo "=== Starting OpenCode Zen Bridge ==="

OPENCODE_DIR="$HOME/.local/share/opencode"
CONFIG_DIR="$HOME/.config/opencode"

mkdir -p "$OPENCODE_DIR"
mkdir -p "$CONFIG_DIR"

if [ -f "/app/auth.bundle.txt" ]; then
  echo "[Entrypoint] Unpacking auth.bundle.txt into $OPENCODE_DIR/auth.json..."
  base64 -d < /app/auth.bundle.txt > "$OPENCODE_DIR/auth.json"
  chmod 600 "$OPENCODE_DIR/auth.json"
fi

if [ -n "$OPENCODE_AUTH_B64" ]; then
  echo "[Entrypoint] Decoding and injecting OPENCODE_AUTH_B64 into $OPENCODE_DIR/auth.json..."
  echo "$OPENCODE_AUTH_B64" | base64 -d > "$OPENCODE_DIR/auth.json"
  chmod 600 "$OPENCODE_DIR/auth.json"
fi

if [ -f "$OPENCODE_DIR/auth.json" ]; then
  echo "[Entrypoint] Auth file verified ($(wc -c < "$OPENCODE_DIR/auth.json") bytes)."
else
  echo "[Entrypoint] WARNING: No auth.json detected!"
fi

echo "[Entrypoint] OpenCode CLI version: $(opencode --version 2>/dev/null || echo 'not installed')"

exec node server.mjs
