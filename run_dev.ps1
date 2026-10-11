# Run script for Windows PowerShell in VS Code
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " Starting NMC-OPT Platform in VS Code..." -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Start Backend in a dedicated terminal window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; Write-Host 'Starting Backend on http://127.0.0.1:8008...' -ForegroundColor Green; python -m uvicorn app.main:app --host 127.0.0.1 --port 8008 --reload"

# Start Frontend in a dedicated terminal window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; Write-Host 'Starting Frontend on http://localhost:5173...' -ForegroundColor Green; npm run dev"

Write-Host "Services launched successfully!" -ForegroundColor Green
Write-Host "  Frontend Web UI: http://localhost:5173" -ForegroundColor Yellow
Write-Host "  Backend API:     http://127.0.0.1:8008" -ForegroundColor Yellow
Write-Host "  Swagger Docs:    http://127.0.0.1:8008/docs" -ForegroundColor Yellow
