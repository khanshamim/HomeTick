#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# start.sh — HomeTick backend startup script
# Usage: ./start.sh [--prod]
#   (no flag)   → development mode with --reload
#   --prod      → production mode (no reload, 4 workers)
# ---------------------------------------------------------------------------

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

VENV_PYTHON="$SCRIPT_DIR/.venv/bin/python"
VENV_UVICORN="$SCRIPT_DIR/.venv/bin/uvicorn"

# ── 1. Check virtual environment exists ─────────────────────────────────────
if [ ! -f "$VENV_UVICORN" ]; then
  echo "❌  Virtual environment not found."
  echo "    Run: python3.13 -m venv .venv && .venv/bin/pip install -r requirements.txt"
  exit 1
fi

# ── 2. Check .env exists ─────────────────────────────────────────────────────
if [ ! -f "$SCRIPT_DIR/.env" ]; then
  echo "❌  .env file not found."
  echo "    Run: cp .env.example .env  then fill in DATABASE_URL and FIREBASE_CREDENTIALS_PATH"
  exit 1
fi

# ── 3. Load .env so we can validate required vars ────────────────────────────
set -a
# shellcheck source=.env
source "$SCRIPT_DIR/.env"
set +a

if [ -z "${DATABASE_URL:-}" ]; then
  echo "❌  DATABASE_URL is not set in .env"
  exit 1
fi

if [ -z "${FIREBASE_CREDENTIALS_PATH:-}" ]; then
  echo "❌  FIREBASE_CREDENTIALS_PATH is not set in .env"
  exit 1
fi

if [ ! -f "$SCRIPT_DIR/$FIREBASE_CREDENTIALS_PATH" ] && [ ! -f "$FIREBASE_CREDENTIALS_PATH" ]; then
  echo "⚠️   Firebase credentials file not found at: $FIREBASE_CREDENTIALS_PATH"
  echo "    Notifications will not work until the file is placed correctly."
fi

# ── 4. Start server ──────────────────────────────────────────────────────────
HOST="${HOST:-0.0.0.0}"
PORT="${PORT:-8005}"

if [ "${1:-}" = "--prod" ]; then
  echo "🚀  Starting HomeTick API in PRODUCTION mode on $HOST:$PORT"
  exec "$VENV_UVICORN" app.main:app \
    --host "$HOST" \
    --port "$PORT" \
    --workers 4 \
    --no-access-log
else
  echo "🔧  Starting HomeTick API in DEVELOPMENT mode on $HOST:$PORT"
  echo "    Docs: http://localhost:$PORT/docs"
  echo ""
  exec "$VENV_UVICORN" app.main:app \
    --host "$HOST" \
    --port "$PORT" \
    --reload
fi
