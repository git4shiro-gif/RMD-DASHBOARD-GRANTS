# Quick Manual Guide: Set Static IP in Windows

## Option 1: Windows Settings (EASIEST - 2 minutes)

### Step-by-step:

1. **Press** `Windows Key + I` to open Settings
   
2. **Click** on `Network & Internet`

3. **Click** on `Wi-Fi` (left sidebar)

4. **Click** on your connected Wi-Fi network name

5. **Scroll down** to "IP settings"

6. **Click** the `Edit` button next to "IP assignment"

7. **Change** from "Automatic (DHCP)" to **"Manual"**

8. **Turn ON** the IPv4 toggle

9. **Enter these values:**
   ```
   IP address:       10.6.4.150
   Subnet mask:      255.255.252.0
   Gateway:          10.6.4.1
   Preferred DNS:    202.90.135.98
   Alternate DNS:    8.8.8.8
   ```

10. **Click** `Save`

11. **Done!** Your IP is now static and permanent!

---

## Option 2: PowerShell (Run as Administrator)

1. **Right-click** Start Menu → **Windows PowerShell (Admin)**

2. **Copy and paste** this entire block:

```powershell
$interfaceAlias = "Wi-Fi"
$newIP = "10.6.4.150"
$gateway = "10.6.4.1"
$prefixLength = 22
$dns = @("202.90.135.98", "202.90.135.99", "8.8.8.8", "1.1.1.1")

Remove-NetIPAddress -InterfaceAlias $interfaceAlias -AddressFamily IPv4 -Confirm:$false
Remove-NetRoute -InterfaceAlias $interfaceAlias -AddressFamily IPv4 -Confirm:$false
Start-Sleep -Seconds 2

New-NetIPAddress -InterfaceAlias $interfaceAlias -IPAddress $newIP -PrefixLength $prefixLength -DefaultGateway $gateway
Set-DnsClientServerAddress -InterfaceAlias $interfaceAlias -ServerAddresses $dns

Write-Host "Static IP configured successfully!" -ForegroundColor Green
```

3. **Press Enter**

4. **Done!**

---

## How to Verify:

After setting static IP, run this in PowerShell:

```powershell
Get-NetIPAddress -InterfaceAlias "Wi-Fi" -AddressFamily IPv4 | Select IPAddress, PrefixOrigin
```

Should show:
```
IPAddress  PrefixOrigin
---------  ------------
10.6.4.150 Manual       ← Should say "Manual" not "Dhcp"!
```

---

## Why This Matters:

### Before (DHCP):
- ❌ IP changes every restart
- ❌ Update .env daily
- ❌ Backend breaks tomorrow

### After (Static):
- ✅ IP stays 10.6.4.150 forever
- ✅ No daily configuration
- ✅ Works after every shutdown!

---

**Choose Option 1 (Windows Settings) - it's the easiest!**
