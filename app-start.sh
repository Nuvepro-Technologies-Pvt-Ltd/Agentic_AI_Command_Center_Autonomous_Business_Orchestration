#!/bin/bash

export PATH="$PATH:/home/labuser/.local/bin"
set -e

BASE_DIR="$(cd "$(dirname "$0")" && pwd)"
FRONTEND_DIR="$BASE_DIR"

echo "Starting EXLPlain Node.js application..."

cd "$FRONTEND_DIR"

# -------------------------------
# Step 1: Ensure Node.js is installed
# -------------------------------
echo "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "Node.js not found. Installing..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo "Node.js is already installed."
fi

# Verify installation
node -v
npm -v

# -------------------------------
# Step 2: Install dependencies
# -------------------------------
echo "Installing dependencies..."
npm install

# -------------------------------
# Step 3: Start the server/frontend
# -------------------------------
echo "Starting Frontend..."
npm start &
FRONTEND_PID=$!

# Wait a few seconds to allow server to start
sleep 5

# -------------------------------
# Step 4: Open in browser
# -------------------------------
APP_URL="http://localhost:4000"
echo "Opening $APP_URL in default browser..."
xdg-open "$APP_URL" >/dev/null 2>&1 || echo "Could not auto-open browser."

echo "Frontend PID: $FRONTEND_PID"

# -------------------------------
# Step 5: Handle exit cleanly
# -------------------------------
trap "echo 'Stopping application...'; kill $FRONTEND_PID" SIGINT

wait $FRONTEND_PID
