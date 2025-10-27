# MySQL Network Configuration Script
# Run this script as Administrator

Write-Host "=================================" -ForegroundColor Cyan
Write-Host "MySQL Network Setup for Device 1" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "⚠️  WARNING: Not running as Administrator!" -ForegroundColor Yellow
    Write-Host "Some steps may fail. Please run PowerShell as Administrator." -ForegroundColor Yellow
    Write-Host ""
}

# Step 1: Backup my.ini
Write-Host "Step 1: Backing up MySQL config..." -ForegroundColor Green
$configFile = "C:\xampp\mysql\bin\my.ini"
$backupFile = "C:\xampp\mysql\bin\my.ini.backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"

if (Test-Path $configFile) {
    Copy-Item $configFile $backupFile
    Write-Host "✓ Backup created: $backupFile" -ForegroundColor Green
} else {
    Write-Host "✗ MySQL config not found at $configFile" -ForegroundColor Red
    Write-Host "Please check your XAMPP installation path." -ForegroundColor Yellow
    exit
}

# Step 2: Modify my.ini to allow network connections
Write-Host ""
Write-Host "Step 2: Configuring MySQL for network access..." -ForegroundColor Green

$content = Get-Content $configFile
$modified = $false
$newContent = @()

foreach ($line in $content) {
    if ($line -match "^\s*bind-address\s*=\s*127\.0\.0\.1" -or $line -match "^\s*bind-address\s*=\s*localhost") {
        $newContent += "# $line  # Commented out to allow network access"
        $newContent += "bind-address = 0.0.0.0"
        $modified = $true
        Write-Host "✓ Changed bind-address to 0.0.0.0" -ForegroundColor Green
    } else {
        $newContent += $line
    }
}

if (-not $modified) {
    Write-Host "⚠️  bind-address line not found in config." -ForegroundColor Yellow
    Write-Host "MySQL may already be configured for network access." -ForegroundColor Yellow
}

$newContent | Set-Content $configFile

# Step 3: Configure Firewall
Write-Host ""
Write-Host "Step 3: Configuring Windows Firewall..." -ForegroundColor Green

try {
    $existingRule = Get-NetFirewallRule -DisplayName "MySQL Database" -ErrorAction SilentlyContinue
    
    if ($existingRule) {
        Write-Host "⚠️  Firewall rule already exists. Removing old rule..." -ForegroundColor Yellow
        Remove-NetFirewallRule -DisplayName "MySQL Database"
    }
    
    New-NetFirewallRule -DisplayName "MySQL Database" -Direction Inbound -Protocol TCP -LocalPort 3306 -Action Allow | Out-Null
    Write-Host "✓ Firewall rule created for MySQL port 3306" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to create firewall rule: $_" -ForegroundColor Red
    Write-Host "Please create the rule manually in Windows Firewall." -ForegroundColor Yellow
}

# Step 4: Instructions for MySQL user setup
Write-Host ""
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "Next Steps (IMPORTANT):" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. RESTART MYSQL in XAMPP Control Panel" -ForegroundColor Yellow
Write-Host "   - Click 'Stop' button for MySQL" -ForegroundColor White
Write-Host "   - Wait 3 seconds" -ForegroundColor White
Write-Host "   - Click 'Start' button for MySQL" -ForegroundColor White
Write-Host ""
Write-Host "2. GRANT REMOTE ACCESS to MySQL user" -ForegroundColor Yellow
Write-Host "   - Click 'Admin' button for MySQL (opens phpMyAdmin)" -ForegroundColor White
Write-Host "   - Go to SQL tab and run this command:" -ForegroundColor White
Write-Host ""
Write-Host "   GRANT ALL PRIVILEGES ON rmd_dashboard.* TO 'root'@'%' IDENTIFIED BY '';" -ForegroundColor Magenta
Write-Host "   FLUSH PRIVILEGES;" -ForegroundColor Magenta
Write-Host ""
Write-Host "3. UPDATE backend\.env file" -ForegroundColor Yellow
Write-Host "   - Change DB_HOST from 'localhost' to '10.6.7.192'" -ForegroundColor White
Write-Host ""
Write-Host "4. RESTART backend server" -ForegroundColor Yellow
Write-Host "   - Press Ctrl+C to stop current server" -ForegroundColor White
Write-Host "   - Run: node server.js" -ForegroundColor White
Write-Host ""
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "Configuration Complete!" -ForegroundColor Green
Write-Host "See NETWORK_DATABASE_SETUP.md for full documentation" -ForegroundColor White
Write-Host "=================================" -ForegroundColor Cyan
