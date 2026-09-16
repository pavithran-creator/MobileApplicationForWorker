@echo off
echo ======================================================
echo   Starting ON-DEMAND Next.js Frontend (Port 3000)
echo ======================================================
cd /d "%~dp0frontend"
call npm run dev
pause
