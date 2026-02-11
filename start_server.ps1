# Math Anxiety & AI Usage Dashboard - PowerShell Launcher

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Math Anxiety & AI Usage Dashboard" -ForegroundColor Yellow
Write-Host "  Starting Local Web Server..." -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check if Python is installed
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✓ Python detected: $pythonVersion" -ForegroundColor Green
    Write-Host ""
    Write-Host "Starting server on port 8000..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Open your browser to: " -NoNewline
    Write-Host "http://localhost:8000" -ForegroundColor Green
    Write-Host ""
    Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host ""
    
    # Start the server
    python -m http.server 8000
}
catch {
    Write-Host "✗ Python not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Python from: " -NoNewline
    Write-Host "https://www.python.org/" -ForegroundColor Blue
    Write-Host ""
    Write-Host "Or try opening index.html directly in your browser" -ForegroundColor Yellow
    Write-Host ""
    pause
}
