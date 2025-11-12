#!/bin/bash

echo "================================================"
echo "  StreamPresence - Discord Rich Presence"
echo "================================================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "[ERROR] .env file not found!"
    echo "Please create a .env file with your Discord Client ID"
    echo "See README.md for configuration details"
    echo ""
    exit 1
fi

# Check if venv exists
if [ ! -d venv ]; then
    echo "[INFO] Creating virtual environment..."
    python3 -m venv venv
    echo ""
fi

# Activate venv and install requirements
echo "[INFO] Installing dependencies..."
source venv/bin/activate
pip install -r requirements.txt
echo ""

# Start the server
echo "[INFO] Starting Discord Rich Presence server..."
echo ""
cd python
python app.py
