#!/bin/bash

export PATH="$PATH:/home/labuser/.local/bin"
set -e

BASE_DIR="$(cd "$(dirname "$0")" && pwd)"
FRONTEND_DIR="$BASE_DIR"

echo "Starting EXLPlain Node.js application..."

cd "$FRONTEND_DIR"

# -------------------------------
# Step 1: Install Node.js and npm
# -------------------------------
echo "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "Node.js not found. Installing..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo "Node.js already installed."
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
# Step 3: Start frontend
# -------------------------------
echo "Starting Frontend..."
npm start &
FRONTEND_PID=$!

echo "Frontend PID: $FRONTEND_PID"

# -------------------------------
# Step 4: Trap and clean up
# -------------------------------
trap "echo 'Stopping application...'; kill $FRONTEND_PID" SIGINT

wait $FRONTEND_PID
