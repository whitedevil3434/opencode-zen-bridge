#!/bin/sh
set -e

echo "=== Starting OpenCode Zen Bridge ==="

OPENCODE_DIR="$HOME/.local/share/opencode"
CONFIG_DIR="$HOME/.config/opencode"

mkdir -p "$OPENCODE_DIR"
mkdir -p "$CONFIG_DIR"

if [ -f "/app/auth.bundle.txt" ]; then
  node /app/unpack-auth.cjs || true
fi

if [ -n "$OPENCODE_AUTH_B64" ]; then
  echo "[Entrypoint] Decoding and injecting OPENCODE_AUTH_B64 into $OPENCODE_DIR/auth.json..."
  node -e "
    const fs = require('fs');
    const path = '$OPENCODE_DIR/auth.json';
    const b64 = (process.env.OPENCODE_AUTH_B64 || '').replace(/\s+/g, '');
    if (b64) {
      fs.writeFileSync(path, Buffer.from(b64, 'base64').toString('utf8'), { mode: 0o600 });
    }
  "
fi

if [ -f "$OPENCODE_DIR/auth.json" ]; then
  echo "[Entrypoint] Auth file verified ($(wc -c < "$OPENCODE_DIR/auth.json") bytes)."
else
  echo "[Entrypoint] WARNING: No auth.json detected!"
fi

echo "[Entrypoint] OpenCode CLI version: $(opencode --version 2>/dev/null || echo 'not installed')"

exec node server.mjs
