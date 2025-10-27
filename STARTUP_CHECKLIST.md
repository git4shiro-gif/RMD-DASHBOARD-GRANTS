# RMD Dashboard - Startup Checklist

This document helps prevent multi-device access issues after shutdown/restart.

## ✅ Current Configuration Status

### MySQL Database
- ✅ **bind-address**: Commented out (allows network access)
- ✅ **Remote access**: Granted to `root@'%'`
- ✅ **Port 3306**: Open and listening on `0.0.0.0`
- 📍 **Config file**: `C:\xampp\mysql\bin\my.ini`

### Windows Firewall
- ✅ **Backend (5000)**: Allowed for all network profiles (Any)
- ✅ **Frontend (5173)**: Allowed for all network profiles (Any)
- ✅ **MySQL (3306)**: Allowed (mysqld rules)
- ⚠️ **Persistent**: Rules survive restarts

### Backend Server
- ✅ **Listening**: `0.0.0.0:5000` (all network interfaces)
- ✅ **CORS**: Enabled
- ✅ **DB_HOST**: Auto-updated by START.ps1 daily
- 📍 **Config file**: `backend\.env`

### Frontend Server
- ✅ **Listening**: `0.0.0.0:5173` (all network interfaces)
- ✅ **API URL**: Auto-detects based on access method
- ✅ **Multi-device**: Uses `window.location.hostname`
- 📍 **Config file**: `AdminPanel\vite.config.js`

## 🚀 Daily Startup Procedure

### Every Morning (After Laptop Shutdown):

1. **Start XAMPP**
   - Open XAMPP Control Panel
   - Click "Start" for MySQL
   - Wait for green "Running" status

2. **Run START.ps1**
   ```powershell
   cd C:\Users\Localuser\Desktop\DashboardMain
   .\START.ps1
   ```
   - Auto-detects current IP (even if changed overnight)
   - Updates `backend\.env` with new IP
   - Kills old Node processes
   - Starts Backend and Frontend servers

3. **Verify Network Access**
   - Note the IP shown in START.ps1 output (e.g., `10.6.4.150`)
   - Test from Device 1: `http://localhost:5173`
   - Share with team: `http://CURRENT_IP:5173`

## ⚠️ Potential Issues After Shutdown

### Issue 1: IP Address Changed
**Symptom**: Other devices can't connect, "connection refused"
**Cause**: DHCP assigned new IP after overnight shutdown
**Solution**: START.ps1 automatically handles this! Just check the new IP in output.
**Manual Fix**: 
```powershell
ipconfig | Select-String "IPv4" | Select-String "10\."
# Update backend\.env with new IP
```

### Issue 2: MySQL Not Running
**Symptom**: "Cannot connect to database" errors
**Cause**: MySQL stops when laptop shuts down
**Solution**: Start MySQL in XAMPP Control Panel
**Verification**:
```powershell
Get-Process -Name "mysqld" -ErrorAction SilentlyContinue
Test-NetConnection -ComputerName localhost -Port 3306
```

### Issue 3: Firewall Rules Disabled
**Symptom**: Other devices can't connect, but localhost works
**Cause**: Windows Update or security software disabled rules
**Solution**: Re-enable firewall rules
```powershell
Set-NetFirewallRule -DisplayName "RMD Dashboard Backend (5000)" -Enabled True
Set-NetFirewallRule -DisplayName "RMD Dashboard Frontend (5173)" -Enabled True
```

### Issue 4: Node Processes Still Running
**Symptom**: "Port already in use" errors
**Cause**: Previous Node processes didn't close properly
**Solution**: START.ps1 automatically kills old processes
**Manual Fix**:
```powershell
taskkill /F /IM node.exe
```

### Issue 5: Wrong Network Profile
**Symptom**: Works on Device 1, fails on all other devices
**Cause**: Wi-Fi changed from Private to Public network
**Solution**: Firewall rules already set to "Any" profile
**Verification**:
```powershell
Get-NetConnectionProfile
Get-NetFirewallRule -DisplayName "*RMD Dashboard*" | Select-Object Profile
```

## 🔍 Quick Troubleshooting

### Test 1: Check MySQL
```powershell
Get-Process mysqld
netstat -an | findstr :3306
```
Expected: `0.0.0.0:3306` or `[::]:3306` listening

### Test 2: Check Backend
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/health"
```
Expected: `{"status": "OK", "message": "RMD Dashboard API is running"}`

### Test 3: Check Frontend
```powershell
Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing
```
Expected: `StatusCode: 200`

### Test 4: Check Network Access (from Device 1)
```powershell
$ip = (ipconfig | Select-String "IPv4" | Select-String "10\." | Select-Object -First 1) -replace '.*: ',''
Invoke-WebRequest -Uri "http://$ip:5173" -UseBasicParsing
```
Expected: `StatusCode: 200`

### Test 5: Check Firewall Rules
```powershell
Get-NetFirewallRule -DisplayName "*RMD Dashboard*" | Select-Object DisplayName, Enabled, Profile
```
Expected: Both rules `Enabled: True`, `Profile: Any`

## 📋 Files That Must NOT Change

These files ensure multi-device access works:

1. **`backend\.env`**
   - Auto-updated by START.ps1
   - Must have: `DB_HOST=<current_IP>`

2. **`C:\xampp\mysql\bin\my.ini`**
   - Must have: `# bind-address="127.0.0.1"` (commented out)
   - If uncommented, MySQL only allows localhost!

3. **`AdminPanel\src\pages\grants\NAFES.jsx`**
   - Must have: `API_BASE_URL` auto-detection code
   - Lines 16-18:
   ```javascript
   const API_BASE_URL = window.location.hostname === 'localhost' 
     ? 'http://localhost:5000' 
     : `http://${window.location.hostname}:5000`;
   ```

4. **`AdminPanel\vite.config.js`**
   - Must have: `host: '0.0.0.0'`
   - If changed to `localhost`, only Device 1 can access!

5. **`backend\server.js`**
   - Must have: `app.listen(PORT, '0.0.0.0', ...)`
   - If changed to `localhost`, API only accessible from Device 1!

## 🔐 Security Notes

- **Public Network**: Firewall rules set to "Any" to work on company Wi-Fi
- **No Password**: MySQL root has no password (local network only)
- **Company Laptop**: Current setup should be safe for same-network access
- **If Concerned**: Ask IT about DHCP reservation for stable IP

## 📱 Share With Team

After running START.ps1, share this info:

```
RMD Dashboard Access:
URL: http://10.6.4.150:5173
(IP may change daily - check START.ps1 output)

Available Pages:
- Home Dashboard
- Grants → NAFES (with real CSV data)
- Other grant pages (mock data)

CSV Upload:
- Only upload from Device 1
- Data appears immediately on all devices
```

## 🛠️ Emergency Reset

If nothing works after shutdown:

```powershell
# 1. Stop everything
taskkill /F /IM node.exe

# 2. Restart MySQL in XAMPP

# 3. Run START.ps1
.\START.ps1

# 4. If still broken, re-add firewall rules
Start-Process powershell -Verb RunAs -ArgumentList "-NoExit", "-Command", "cd '$PWD'; .\add-firewall-rules.ps1"
```

## ✨ Success Indicators

You'll know everything is working when:
- ✅ START.ps1 shows current IP
- ✅ Two PowerShell windows stay open (Backend & Frontend)
- ✅ `http://localhost:5173` works on Device 1
- ✅ `http://CURRENT_IP:5173` works on other devices
- ✅ NAFES page shows uploaded CSV data
- ✅ All devices see the same data

---

**Last Updated**: Auto-generated after network setup
**Current IP**: Check START.ps1 output daily
**Support**: Check DEVICE2_SETUP_GUIDE.md for other device setup
