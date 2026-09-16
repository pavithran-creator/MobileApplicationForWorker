@echo off
echo ======================================================
echo   Starting ON-DEMAND FastAPI Backend (Port 8000)
echo ======================================================
cd /d "%~dp0backend"

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

echo Checking python dependencies...
%PYTHON_CMD% -m pip install -r requirements.txt

echo Verifying database seed data...
%PYTHON_CMD% seed.py

echo Launching Uvicorn server on http://localhost:8000 ...
%PYTHON_CMD% -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Backend encountered an issue. Please verify Python is installed.
)
pause
