@echo off
echo ========================================================
echo   Launching ON-DEMAND Mobile App Preview (Web / Browser)
echo ========================================================
cd /d "%~dp0mobile"
call npm run web
pause
