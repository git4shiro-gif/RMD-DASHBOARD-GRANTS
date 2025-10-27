# Set Static IP Address Script
# RIGHT-CLICK THIS FILE → "Run with PowerShell" (as Administrator)

Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "Static IP Configuration for RMD Dashboard" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
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

# Current network settings (detected from your system)
$InterfaceAlias = "Wi-Fi"
$CurrentIP = "10.6.4.150"
$Gateway = "10.6.4.1"
$PrefixLength = 22
$DNS1 = "202.90.135.98"
$DNS2 = "202.90.135.99"

Write-Host "Current Network Configuration:" -ForegroundColor Yellow
Write-Host "  Interface: $InterfaceAlias" -ForegroundColor White
Write-Host "  IP Address: $CurrentIP (DHCP - Changes on restart)" -ForegroundColor Red
Write-Host "  Gateway: $Gateway" -ForegroundColor White
Write-Host "  Subnet: /$PrefixLength" -ForegroundColor White
Write-Host "  DNS Servers: $DNS1, $DNS2" -ForegroundColor White
Write-Host ""

Write-Host "New Static IP Configuration:" -ForegroundColor Yellow
Write-Host "  IP Address: $CurrentIP (STATIC - Permanent!)" -ForegroundColor Green
Write-Host "  Gateway: $Gateway" -ForegroundColor White
Write-Host "  Subnet: /$PrefixLength" -ForegroundColor White
Write-Host "  DNS Servers: $DNS1, $DNS2, 8.8.8.8, 1.1.1.1" -ForegroundColor White
Write-Host ""

Write-Host "This will:" -ForegroundColor Cyan
Write-Host "  ✓ Set your IP to $CurrentIP permanently" -ForegroundColor Green
Write-Host "  ✓ Survive laptop shutdown/restart" -ForegroundColor Green
Write-Host "  ✓ No need to update .env file daily" -ForegroundColor Green
Write-Host ""

$confirm = Read-Host "Continue with static IP setup? (Y/N)"
if ($confirm -ne 'Y' -and $confirm -ne 'y') {
    Write-Host "Operation cancelled." -ForegroundColor Yellow
    Write-Host "Press any key to exit..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 0
}

Write-Host ""
Write-Host "Setting static IP address..." -ForegroundColor Yellow

try {
    # Remove existing IP configuration
    Write-Host "  - Removing DHCP configuration..." -ForegroundColor Gray
    Remove-NetIPAddress -InterfaceAlias $InterfaceAlias -AddressFamily IPv4 -Confirm:$false -ErrorAction SilentlyContinue
    Remove-NetRoute -InterfaceAlias $InterfaceAlias -AddressFamily IPv4 -Confirm:$false -ErrorAction SilentlyContinue
    
    Start-Sleep -Seconds 2
    
    # Set static IP
    Write-Host "  - Setting static IP address: $CurrentIP..." -ForegroundColor Gray
    New-NetIPAddress -InterfaceAlias $InterfaceAlias `
        -IPAddress $CurrentIP `
        -PrefixLength $PrefixLength `
        -DefaultGateway $Gateway `
        -AddressFamily IPv4 | Out-Null
    
    # Set DNS servers
    Write-Host "  - Configuring DNS servers..." -ForegroundColor Gray
    Set-DnsClientServerAddress -InterfaceAlias $InterfaceAlias `
        -ServerAddresses @($DNS1, $DNS2, "8.8.8.8", "1.1.1.1")
    
    Write-Host ""
    Write-Host "✓ Static IP configured successfully!" -ForegroundColor Green
    
} catch {
    Write-Host ""
    Write-Host "✗ Error setting static IP: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "You may need to configure it manually:" -ForegroundColor Yellow
    Write-Host "1. Open Settings → Network & Internet → Wi-Fi" -ForegroundColor White
    Write-Host "2. Click on your Wi-Fi network" -ForegroundColor White
    Write-Host "3. Click 'Edit' under IP settings" -ForegroundColor White
    Write-Host "4. Select 'Manual' and enter:" -ForegroundColor White
    Write-Host "   IP: $CurrentIP" -ForegroundColor Gray
    Write-Host "   Subnet: 255.255.252.0" -ForegroundColor Gray
    Write-Host "   Gateway: $Gateway" -ForegroundColor Gray
    Write-Host "   DNS: $DNS1" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Press any key to exit..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

Write-Host ""
Write-Host "Verifying configuration..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

$newIP = Get-NetIPAddress -InterfaceAlias $InterfaceAlias -AddressFamily IPv4 | Select-Object -ExpandProperty IPAddress

if ($newIP -eq $CurrentIP) {
    Write-Host "✓ IP address verified: $newIP" -ForegroundColor Green
} else {
    Write-Host "⚠ IP address may have changed to: $newIP" -ForegroundColor Yellow
}

# Test internet connectivity
Write-Host ""
Write-Host "Testing internet connectivity..." -ForegroundColor Yellow
$pingResult = Test-Connection -ComputerName 8.8.8.8 -Count 2 -Quiet

if ($pingResult) {
    Write-Host "✓ Internet connection working!" -ForegroundColor Green
} else {
    Write-Host "⚠ Internet connection test failed" -ForegroundColor Yellow
    Write-Host "  This may be temporary. Try opening a browser to verify." -ForegroundColor Gray
}

Write-Host ""
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "Static IP Setup Complete!" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your laptop will now ALWAYS use IP: $CurrentIP" -ForegroundColor Green
Write-Host "Even after shutdown and restart!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Backend .env already configured: DB_HOST=$CurrentIP ✓" -ForegroundColor White
Write-Host "2. Restart backend server to apply changes" -ForegroundColor White
Write-Host "3. Your dashboard will work every day without updates!" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
