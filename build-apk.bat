@echo off
title ON-DEMAND APK Builder
cls
echo ========================================================
echo   ON-DEMAND Android APK Builder
echo   Package: org.tncoop.ondemand
echo ========================================================
echo.
echo   [1] Cloud APK Build via EAS (Recommended - No Android Studio/Java needed)
echo   [2] Local APK Build via Gradle (Requires Android SDK & Java JDK)
echo.
set /p buildChoice="Choose build method (1 or 2): "

if "%buildChoice%"=="1" (
    echo.
    echo ========================================================
    echo Starting EAS Cloud APK Build...
    echo (You will be prompted to log in to Expo if not already)
    echo ========================================================
    cd /d "%~dp0mobile"
    call npx -y eas-cli build -p android --profile preview
)

if "%buildChoice%"=="2" (
    echo.
    echo ========================================================
    echo Generating Android Native Project & Building Release APK...
    echo ========================================================
    cd /d "%~dp0mobile"
    call npx expo prebuild --platform android --clean
    if exist android (
        cd android
        call gradlew.bat assembleRelease
        echo.
        echo ========================================================
        echo Build finished! Your APK is located at:
        echo mobile\android\app\build\outputs\apk\release\app-release.apk
        echo ========================================================
    ) else (
        echo [ERROR] Prebuild failed to create android directory.
    )
)

pause
