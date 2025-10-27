# Add Firewall Rules for RMD Dashboard
# Run as Administrator

Write-Host "================================" -ForegroundColor Cyan
Write-Host "RMD Dashboard Firewall Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check admin
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "ERROR: Not running as Administrator!" -ForegroundColor Red
    Write-Host "Right-click and select 'Run as Administrator'" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "Adding firewall rules..." -ForegroundColor Yellow
Write-Host ""

# Remove old rules if they exist
Get-NetFirewallRule -DisplayName "RMD Dashboard*" -ErrorAction SilentlyContinue | Remove-NetFirewallRule

# Add rule for Backend (port 5000)
try {
    New-NetFirewallRule `
        -DisplayName "RMD Dashboard Backend (5000)" `
        -Direction Inbound `
        -Protocol TCP `
        -LocalPort 5000 `
        -Action Allow `
        -Profile Private,Domain `
        -Enabled True | Out-Null
    
    Write-Host "✓ Backend port 5000 allowed" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to add backend rule: $_" -ForegroundColor Red
}

# Add rule for Frontend (port 5173)
try {
    New-NetFirewallRule `
        -DisplayName "RMD Dashboard Frontend (5173)" `
        -Direction Inbound `
        -Protocol TCP `
        -LocalPort 5173 `
        -Action Allow `
        -Profile Private,Domain `
        -Enabled True | Out-Null
    
    Write-Host "✓ Frontend port 5173 allowed" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to add frontend rule: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Firewall Configuration Complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Network Access URLs:" -ForegroundColor Yellow
Write-Host "  Frontend: http://YOUR_IP:5173" -ForegroundColor White
Write-Host "  Backend:  http://YOUR_IP:5000" -ForegroundColor White
Write-Host ""
Write-Host "Test from another device:" -ForegroundColor Yellow
Write-Host "  Test-NetConnection -ComputerName YOUR_IP -Port 5173" -ForegroundColor Gray
Write-Host ""
pause
