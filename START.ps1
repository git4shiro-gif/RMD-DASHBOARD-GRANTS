# RMD Dashboard Auto-Start Script (Full Featured)
# Detects IP, updates backend config, kills old servers, starts backend & frontend

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "RMD Dashboard Auto-Start" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

try {
    # Check Node.js and npm
    if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
        Write-Host "ERROR: Node.js is not installed or not in PATH." -ForegroundColor Red
        pause
        exit 1
    }
    if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
        Write-Host "ERROR: npm is not installed or not in PATH." -ForegroundColor Red
        pause
        exit 1
    }

    # Paths
    $backendPath = Join-Path $PSScriptRoot "backend"
    $frontendPath = Join-Path $PSScriptRoot "AdminPanel"

    if (-not (Test-Path $backendPath)) {
        Write-Host "ERROR: Backend folder not found at $backendPath" -ForegroundColor Red
        pause
        exit 1
    }
    if (-not (Test-Path $frontendPath)) {
        Write-Host "ERROR: Frontend folder not found at $frontendPath" -ForegroundColor Red
        pause
        exit 1
    }

    # Detect local IP (10.x or 192.168.x.x, fallback to localhost)
    Write-Host "Detecting local network IP..." -ForegroundColor Yellow
    $ipLine = ipconfig | Select-String "IPv4" | Select-String "10\\.|192\\.168\\." | Select-Object -First 1
    $currentIP = if ($ipLine) { ($ipLine -replace '.*: ','').Trim() } else { "localhost" }
    Write-Host "Using IP: $currentIP" -ForegroundColor Green

    # Update backend .env
    $envFile = Join-Path $backendPath ".env"
    if (Test-Path $envFile) {
        $envContent = Get-Content $envFile -Raw
        if ($envContent -match "DB_HOST=") {
            $envContent = $envContent -replace 'DB_HOST=.*', "DB_HOST=$currentIP"
        } else {
            $envContent += "`nDB_HOST=$currentIP"
        }
        $envContent | Set-Content $envFile -NoNewline
        Write-Host "Backend .env updated: DB_HOST=$currentIP" -ForegroundColor Green
    } else {
        Write-Host "WARNING: .env file not found in backend folder." -ForegroundColor Yellow
    }

    # Kill any existing Node processes
    Write-Host "Stopping existing Node.js servers..." -ForegroundColor Yellow
    taskkill /F /IM node.exe 2>$null | Out-Null
    Start-Sleep -Seconds 1
    Write-Host "Cleared old Node.js processes" -ForegroundColor Green

    # Start backend server
    Write-Host "Starting Backend Server..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd `"$backendPath`"; node server.js"

    Start-Sleep -Seconds 2

    # Start frontend server
    Write-Host "Starting Frontend Server..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd `"$frontendPath`"; npm run dev"

    Write-Host ""
    Write-Host "Servers started. Check the new PowerShell windows for output." -ForegroundColor Green
    Write-Host "Backend:   http://localhost:5000" -ForegroundColor White
    Write-Host "Frontend:  http://localhost:5173" -ForegroundColor White
    Write-Host "Network:   http://$currentIP:5173" -ForegroundColor White
    Write-Host ""
    Write-Host "Press any key to close this window..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}
catch {
    Write-Host "A script error occurred: $_" -ForegroundColor Red
    Write-Host "Press any key to close this window..." -ForegroundColor Gray
    pause
    exit 1
}