@echo off
title ON-DEMAND Labour Cooperative Launcher
cls
echo ========================================================
echo   ON-DEMAND Labour Cooperative Platform Launcher
echo ========================================================
echo.
echo   [1] Run Mobile App (Web Browser Preview - Port 8081)
echo   [2] Run Mobile App (Expo Go QR Code for Phone)
echo   [3] Run Web Application (Next.js - Port 3000)
echo   [4] Run BOTH Web + Mobile App simultaneously
echo   [5] Open Standalone Interactive Mobile Simulator (Zero Server)
echo   [6] Build Android APK (Installable .apk file)
echo.
set /p choice="Select an option (1-6): "

if "%choice%"=="1" (
    echo Launching Mobile Web Preview...
    cd /d "%~dp0mobile"
    npm run web
)
if "%choice%"=="2" (
    echo Launching Expo Go Dev Server...
    cd /d "%~dp0mobile"
    npx expo start
)
if "%choice%"=="3" (
    echo Launching Next.js Web Application...
    cd /d "%~dp0frontend"
    npm run dev
)
if "%choice%"=="4" (
    echo Starting Web App in a new window...
    start "ON-DEMAND Web App (Port 3000)" cmd /k "cd /d %~dp0frontend && npm run dev"
    echo Starting Mobile App Preview in this window...
    cd /d "%~dp0mobile"
    npm run web
)
if "%choice%"=="5" (
    echo Opening Standalone Interactive Simulator...
    start "" "%~dp0mobile\preview.html"
)
if "%choice%"=="6" (
    call "%~dp0build-apk.bat"
)
pause
