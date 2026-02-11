@echo off
echo ============================================
echo   Math Anxiety & AI Usage Dashboard
echo   Starting Local Web Server...
echo ============================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo Python detected! Starting server on port 8000...
    echo.
    echo Open your browser to: http://localhost:8000
    echo.
    echo Press Ctrl+C to stop the server
    echo ============================================
    python -m http.server 8000
) else (
    echo Python not found!
    echo.
    echo Please install Python from https://www.python.org/
    echo Or open index.html directly in your browser
    pause
)
