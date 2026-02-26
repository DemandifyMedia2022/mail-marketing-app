@echo off
echo 🚀 Opening KT Documentation for PDF generation...
echo.

REM Get the current directory
cd /d "%~dp0"

REM Check if HTML file exists
if exist "KT_DOCUMENTATION.html" (
    echo 📄 Found documentation file
    echo 🌐 Opening in default browser...
    echo.
    start KT_DOCUMENTATION.html
    
    echo.
    echo 📋 PDF Generation Instructions:
    echo    1. In the browser, press Ctrl+P
    echo    2. Select "Save as PDF" 
    echo    3. Click "Save"
    echo    4. Choose your save location
    echo.
    echo 📊 Documentation includes:
    echo    • 21 comprehensive sections
    echo    • Complete technical architecture  
    echo    • API documentation
    echo    • Database schemas
    echo    • Deployment guide
    echo    • Troubleshooting guide
    echo.
    echo ✨ Ready for developer onboarding!
    echo.
    echo Press any key to exit (documentation will remain open)...
    pause >nul
) else (
    echo ❌ Documentation file not found!
    echo Expected: KT_DOCUMENTATION.html
    echo.
    pause
)
