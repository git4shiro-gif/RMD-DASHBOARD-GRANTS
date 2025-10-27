# RMD Dashboard Auto-Start Script
# Automatically detects IP, updates config, and starts servers

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "RMD Dashboard Auto-Start" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get current IP address
Write-Host "Detecting network IP address..." -ForegroundColor Yellow
try {
    $ipLine = ipconfig | Select-String "IPv4" | Select-String "10\." | Select-Object -First 1
    $currentIP = ($ipLine -replace '.*: ','').Trim()
}
catch {
    $currentIP = $null
}

if (-not $currentIP) {
    Write-Host "WARNING: Could not detect IP starting with 10.x" -ForegroundColor Yellow
    Write-Host "Falling back to localhost..." -ForegroundColor Gray
    $currentIP = "localhost"
}
else {
    Write-Host "Detected IP: $currentIP" -ForegroundColor Green
}

Write-Host ""

# Update backend .env file
$envFile = ".\backend\.env"
Write-Host "Updating backend configuration..." -ForegroundColor Yellow

if (Test-Path $envFile) {
    $envContent = Get-Content $envFile -Raw
    $envContent = $envContent -replace 'DB_HOST=.*', "DB_HOST=$currentIP"
    $envContent | Set-Content $envFile -NoNewline
    
    Write-Host "Backend .env updated: DB_HOST=$currentIP" -ForegroundColor Green
}
else {
    Write-Host "ERROR: .env file not found!" -ForegroundColor Red
    pause
    exit 1
}

Write-Host ""

# Kill any existing Node processes
Write-Host "Stopping existing servers..." -ForegroundColor Yellow
taskkill /F /IM node.exe 2>$null | Out-Null
Start-Sleep -Seconds 1
Write-Host "Cleared old processes" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting Servers..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$backendPath = Join-Path $scriptDir "backend"
$frontendPath = Join-Path $scriptDir "AdminPanel"

# Start backend server
Write-Host "Starting Backend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$backendPath'; Write-Host 'Backend Server' -ForegroundColor Green; node server.js"
)

Start-Sleep -Seconds 3

# Start frontend server
Write-Host "Starting Frontend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$frontendPath'; Write-Host 'Frontend Server' -ForegroundColor Green; npm run dev"
)

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Servers Starting!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "  Database IP:  $currentIP" -ForegroundColor White
Write-Host "  Backend:      http://localhost:5000" -ForegroundColor White
Write-Host "  Frontend:     http://localhost:5173" -ForegroundColor White
Write-Host "  Network:      http://${currentIP}:5173" -ForegroundColor White
Write-Host ""
Write-Host "Two PowerShell windows opened:" -ForegroundColor Cyan
Write-Host "  1. Backend Server (keep open)" -ForegroundColor White
Write-Host "  2. Frontend Server (keep open)" -ForegroundColor White
Write-Host ""
Write-Host "Dashboard ready at: http://localhost:5173" -ForegroundColor Green
Write-Host ""
Write-Host "Press any key to close this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
