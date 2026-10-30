#!/usr/bin/env bash
# ========================================================
# NMC-OPT Studio: Comprehensive Test Suite (Linux / macOS)
# ========================================================

set -e

echo "========================================================"
echo " NMC-OPT Studio: Comprehensive Test Suite"
echo "========================================================"

echo ""
echo "[1/2] Running Backend Pytest Verification Suite..."
cd backend
python3 -m pytest tests/ -v
cd ..

echo ""
echo "[2/2] Running Frontend TypeScript Typecheck & Build Check..."
cd frontend
npm run build
cd ..

echo ""
echo "========================================================"
echo " [SUCCESS] All verification tests passed successfully!"
echo "========================================================"
