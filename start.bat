@echo off
echo ========================================================
echo   Launching ON-DEMAND Labour Cooperative Marketplace
echo   Backend & Database: Supabase (PostgreSQL)
echo ========================================================

echo Checking Node.js environment...
node -v >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH!
    echo Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

echo Starting Next.js Web Application on http://localhost:3000 ...
cd /d "%~dp0frontend"
call npm run dev
pause
