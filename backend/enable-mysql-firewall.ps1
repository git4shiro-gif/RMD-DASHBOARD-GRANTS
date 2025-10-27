# MySQL Firewall Configuration Script
# RIGHT-CLICK THIS FILE → "Run with PowerShell" (as Administrator)

Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "MySQL Firewall Rule Configuration" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "ERROR: Not running as Administrator!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please RIGHT-CLICK this script and select:" -ForegroundColor Yellow
    Write-Host "  'Run with PowerShell' (as Administrator)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Press any key to exit..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

Write-Host "✓ Running as Administrator" -ForegroundColor Green
Write-Host ""

# Remove existing MySQL firewall rules to avoid conflicts
Write-Host "Removing any existing MySQL firewall rules..." -ForegroundColor Yellow
Get-NetFirewallRule -DisplayName "*MySQL*" -ErrorAction SilentlyContinue | Remove-NetFirewallRule -ErrorAction SilentlyContinue
Write-Host "✓ Cleaned up old rules" -ForegroundColor Green
Write-Host ""

# Create new firewall rule for MySQL
Write-Host "Creating firewall rule for MySQL (Port 3306)..." -ForegroundColor Yellow

try {
    New-NetFirewallRule `
        -DisplayName "MySQL Server Network Access" `
        -Description "Allow MySQL database connections from network devices" `
        -Direction Inbound `
        -Protocol TCP `
        -LocalPort 3306 `
        -Action Allow `
        -Profile Domain,Private,Public `
        -Enabled True | Out-Null
    
    Write-Host "✓ Firewall rule created successfully!" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to create firewall rule: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Press any key to exit..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

Write-Host ""
Write-Host "Verifying firewall rule..." -ForegroundColor Yellow
$rule = Get-NetFirewallRule -DisplayName "MySQL Server Network Access" -ErrorAction SilentlyContinue

if ($rule) {
    Write-Host "✓ Firewall rule is active" -ForegroundColor Green
    Write-Host ""
    Write-Host "Rule Details:" -ForegroundColor Cyan
    Write-Host "  Name: $($rule.DisplayName)" -ForegroundColor White
    Write-Host "  Enabled: $($rule.Enabled)" -ForegroundColor White
    Write-Host "  Direction: $($rule.Direction)" -ForegroundColor White
    Write-Host "  Action: $($rule.Action)" -ForegroundColor White
    Write-Host "  Port: 3306 (TCP)" -ForegroundColor White
} else {
    Write-Host "✗ Could not verify firewall rule" -ForegroundColor Red
}

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "Configuration Complete!" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Test MySQL connection from another device:" -ForegroundColor White
Write-Host "   Test-NetConnection -ComputerName 10.6.7.192 -Port 3306" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Update backend .env file:" -ForegroundColor White
Write-Host "   DB_HOST=10.6.7.192" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Restart backend server" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
