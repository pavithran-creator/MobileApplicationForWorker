@echo off
echo ========================================================
echo   Launching ON-DEMAND Cooperative Marketplace
echo ========================================================

if exist "%LOCALAPPDATA%\Programs\Python\Python313\python.exe" (
    set PYTHON_CMD="%LOCALAPPDATA%\Programs\Python\Python313\python.exe"
) else (
    py --version >nul 2>&1
    if not errorlevel 1 (
        set PYTHON_CMD=py
    ) else (
        set PYTHON_CMD=python
    )
)

echo [1/2] Starting FastAPI Backend on http://localhost:8000 ...
start "ON-DEMAND Backend (Port 8000)" cmd /k "cd /d "%~dp0backend" && %PYTHON_CMD% -m uvicorn app.main:app --reload --port 8000"

echo [2/2] Starting Next.js Frontend on http://localhost:3000 ...
start "ON-DEMAND Frontend (Port 3000)" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo ========================================================
echo   Both services have been launched!
echo   - Web Application: http://localhost:3000
echo   - Backend Swagger: http://localhost:8000/docs
echo ========================================================
pause
