#!/bin/bash
AUTH_FILE="$HOME/.local/share/opencode/auth.json"

if [ ! -f "$AUTH_FILE" ]; then
  echo "Error: OpenCode auth file not found at $AUTH_FILE"
  echo "Please make sure you have logged into opencode on your machine first."
  exit 1
fi

echo "================================================================"
echo " Copy the string below and paste it as OPENCODE_AUTH_B64 in"
echo " Koyeb / Render Environment Variables:"
echo "================================================================"
echo ""
base64 < "$AUTH_FILE" | tr -d '\n'
echo ""
echo ""
echo "================================================================"
