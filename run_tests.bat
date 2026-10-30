@echo off
echo ========================================================
echo  NMC-OPT Studio: Comprehensive Test Suite (Windows)
echo ========================================================

echo.
echo [1/2] Running Backend Pytest Verification Suite...
cd backend
python -m pytest tests/ -v
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Backend tests failed!
    cd ..
    exit /b 1
)
cd ..

echo.
echo [2/2] Running Frontend TypeScript Typecheck ^& Build Check...
cd frontend
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Frontend build failed!
    cd ..
    exit /b 1
)
cd ..

echo.
echo ========================================================
echo  [SUCCESS] All verification tests passed successfully!
echo ========================================================
