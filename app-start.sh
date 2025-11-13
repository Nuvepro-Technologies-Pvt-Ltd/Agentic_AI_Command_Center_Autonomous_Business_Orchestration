#!/bin/bash

export PATH="$PATH:/home/labuser/.local/bin"
set -e

BASE_DIR="$(cd "$(dirname "$0")" && pwd)"
FRONTEND_DIR="$BASE_DIR"

echo "Starting EXLPlain Node.js application..."

cd "$FRONTEND_DIR"

# -------------------------------
# Step 1: Install dependencies
# -------------------------------
echo "Installing dependencies..."
npm install

# -------------------------------
# Step 2: Start the frontend
# -------------------------------
echo "Starting Frontend..."
npm start &
FRONTEND_PID=$!

# Wait a few seconds to allow server to start
sleep 5

# -------------------------------
# Step 3: Open in browser
# -------------------------------
APP_URL="http://localhost:4000"
echo "Opening $APP_URL in default browser..."
xdg-open "$APP_URL" >/dev/null 2>&1 &

echo "Frontend PID: $FRONTEND_PID"

# -------------------------------
# Step 4: Trap and clean up
# -------------------------------
trap "echo 'Stopping application...'; kill $FRONTEND_PID" SIGINT

wait $FRONTEND_PID
