@echo off
echo ==========================================
echo  Starting NMC-OPT Platform (Backend + Frontend)
echo ==========================================

start "NMC-OPT Backend (Port 8008)" cmd /k "cd backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8008 --reload"
start "NMC-OPT Frontend (Port 5173)" cmd /k "cd frontend && npm run dev"

echo.
echo Both services launched in parallel!
echo Frontend Web UI: http://localhost:5173
echo Backend API:     http://127.0.0.1:8008
echo Swagger Docs:    http://127.0.0.1:8008/docs
echo.
