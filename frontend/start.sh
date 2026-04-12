#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# start.sh — HomeTick frontend startup script
#
# Fixes macOS-specific issues before launching Expo Metro bundler:
#   1. EMFILE "too many open files"  — raises file-descriptor limit
#   2. Watchman socket path too long — sets XDG_STATE_HOME to /tmp so
#      Watchman keeps its socket under /tmp/watchman/... (well under the
#      104-char Unix socket path limit imposed by macOS/BSD)
# ---------------------------------------------------------------------------

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# ── 1. Raise file-descriptor limit ──────────────────────────────────────────
ulimit -n 65536 2>/dev/null || true   # no-op if already at hard limit

# ── 2. Fix Watchman socket path (long-username workaround) ──────────────────
# XDG_STATE_HOME controls where Watchman stores its state/socket.
# Default (~/.local/state/watchman/...) is too long when the macOS username
# contains dots or is otherwise lengthy.
export XDG_STATE_HOME=/tmp

# Restart any stale daemon so it picks up the new state dir
pkill watchman 2>/dev/null || true
sleep 0.3

# ── 3. Check node_modules ───────────────────────────────────────────────────
if [ ! -d "$SCRIPT_DIR/node_modules" ]; then
  echo "❌  node_modules not found. Run: npm install"
  exit 1
fi

# ── 4. Start Expo ────────────────────────────────────────────────────────────
echo "🚀  Starting HomeTick (Expo SDK 51)..."
echo "    Press 'a' — Android emulator"
echo "    Press 'i' — iOS simulator"
echo "    Scan QR   — Expo Go on your phone"
echo ""

exec npx expo start "$@"
