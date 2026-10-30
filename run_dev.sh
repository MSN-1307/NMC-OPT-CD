#!/usr/bin/env bash
# ========================================================
# NMC-OPT Studio: Unified Startup Script (Linux / macOS)
# ========================================================

set -e

echo "=========================================="
echo " Starting NMC-OPT Platform (Linux/macOS)"
echo "=========================================="

# Check Python environment
if [ -d "backend/venv" ]; then
    source backend/venv/bin/activate
fi

# Launch Backend in background
echo "[1/2] Starting Backend API Server (Port 8008)..."
python3 -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8008 --reload &
BACKEND_PID=$!

# Launch Frontend
echo "[2/2] Starting Frontend Vite Server (Port 5173)..."
cd frontend && npm run dev &
FRONTEND_PID=$!

echo ""
echo "=========================================="
echo " NMC-OPT Studio Services Running"
echo " Web Interface : http://localhost:5173"
echo " Backend API   : http://127.0.0.1:8008"
echo " API Docs      : http://127.0.0.1:8008/docs"
echo " Press CTRL+C to terminate both servers"
echo "=========================================="

# Trap termination and clean up
trap "kill $BACKEND_PID $FRONTEND_PID" SIGINT SIGTERM EXIT
wait
