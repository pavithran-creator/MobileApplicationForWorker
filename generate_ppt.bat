@echo off
title Generating SIH 2026 Presentation...
echo ======================================================================
echo Generating SIH 2026 Presentation: ON-DEMAND Labour Cooperative
echo Using template: docs\template.pptx
echo ======================================================================
cd /d "%~dp0"
py -3.13 generate_sih_presentation.py
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ======================================================================
    echo SUCCESS! Presentation generated at:
    echo docs\ON_DEMAND_SIH_2026_Presentation.pptx
    echo ======================================================================
) else (
    echo.
    echo [ERROR] Failed to run generate_sih_presentation.py.
    echo Trying fallback python launcher...
    python generate_sih_presentation.py
)
echo.
pause
