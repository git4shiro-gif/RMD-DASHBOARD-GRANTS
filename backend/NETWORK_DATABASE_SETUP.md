# Network Database Setup Guide
## Setting up Device 1 as Centralized Database Server

### Current Issue:
- Each device has its own local MySQL database (localhost)
- CSV uploads on Device 1 don't appear on Device 2
- Need to centralize database on Device 1 (IP: 10.6.7.192)

---

## Step-by-Step Configuration

### Step 1: Configure MySQL to Accept Network Connections

**Option A: Manual Edit (Recommended)**
1. Open XAMPP Control Panel
2. Stop MySQL service
3. Open `C:\xampp\mysql\bin\my.ini` in Notepad (as Administrator)
4. Find the line: `bind-address = 127.0.0.1` or `bind-address = localhost`
5. Change it to: `bind-address = 0.0.0.0` (allows all network interfaces)
   - OR comment it out by adding `#` at the start: `# bind-address = 127.0.0.1`
6. Save the file
7. Start MySQL service in XAMPP

**Option B: Using PowerShell (Quick)**
Run the commands in `configure-mysql.ps1` (provided below)

---

### Step 2: Grant Remote Access to MySQL User

Open XAMPP MySQL Admin (phpMyAdmin) or MySQL shell and run:

```sql
-- Option 1: Allow root from any IP (Quick but less secure)
GRANT ALL PRIVILEGES ON rmd_dashboard.* TO 'root'@'%' IDENTIFIED BY '';
FLUSH PRIVILEGES;

-- Option 2: Create dedicated user (More secure - Recommended)
CREATE USER 'rmd_user'@'%' IDENTIFIED BY 'rmd_password_123';
GRANT ALL PRIVILEGES ON rmd_dashboard.* TO 'rmd_user'@'%';
FLUSH PRIVILEGES;
```

**Recommended:** Use Option 2 for production.

---

### Step 3: Configure Windows Firewall

Allow MySQL port 3306 through Windows Firewall:

```powershell
# Run PowerShell as Administrator
New-NetFirewallRule -DisplayName "MySQL Database" -Direction Inbound -Protocol TCP -LocalPort 3306 -Action Allow
```

Or manually:
1. Windows Security → Firewall & network protection
2. Advanced settings
3. Inbound Rules → New Rule
4. Port → TCP → 3306 → Allow

---

### Step 4: Update Backend Configuration

Edit `backend\.env`:

**OLD:**
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
```

**NEW (Option 1 - root user):**
```
DB_HOST=10.6.7.192
DB_USER=root
DB_PASSWORD=
```

**NEW (Option 2 - dedicated user - Recommended):**
```
DB_HOST=10.6.7.192
DB_USER=rmd_user
DB_PASSWORD=rmd_password_123
```

---

### Step 5: Test Connection

Restart backend server and verify:

```powershell
cd C:\Users\Localuser\Desktop\DashboardMain\backend
node server.js
```

Should see: "Server is running on port 5000"

Test API: http://localhost:5000/api/nafes/overview

---

### Step 6: Configure Other Devices

On Device 2, Device 3, etc.:

1. Install Node.js (if not installed)
2. Copy the entire backend folder
3. Run `npm install`
4. Use the SAME `.env` configuration with DB_HOST=10.6.7.192
5. Start backend: `node server.js`

**OR** just point frontend to Device 1's backend API:
- Change frontend API URLs to `http://10.6.7.192:5000/api/nafes`

---

## Troubleshooting

### Issue: "Can't connect to MySQL server"
- Check if MySQL is running on Device 1 (XAMPP Control Panel)
- Verify firewall allows port 3306
- Ping Device 1 from Device 2: `ping 10.6.7.192`

### Issue: "Access denied for user"
- Re-run GRANT ALL PRIVILEGES command
- Verify username/password in .env
- Check MySQL users: `SELECT user, host FROM mysql.user;`

### Issue: Data not syncing
- All devices must use DB_HOST=10.6.7.192 (not localhost)
- Verify all devices can reach 10.6.7.192:3306
- Test MySQL connection: `telnet 10.6.7.192 3306`

---

## Security Notes

⚠️ **For Development:** Using 'root'@'%' with no password is acceptable on local network.

🔒 **For Production:** 
- Create dedicated database user with strong password
- Limit access by IP: `'rmd_user'@'10.6.7.%'` (only your subnet)
- Use SSL/TLS for encrypted connections
- Never expose MySQL port 3306 to public internet

---

## ✅ COMPLETED SETUP (October 23, 2025)

### Current Configuration:
- **Device 1 IP**: `10.6.4.150` (DHCP - may change)
- **MySQL Status**: ✅ Listening on `0.0.0.0:3306` (network accessible)
- **Firewall**: ✅ Rules exist for `mysqld` inbound port 3306
- **Database**: `rmd_dashboard` with remote access granted to `root@'%'`
- **Backend .env**: `DB_HOST=10.6.4.150`

### Verification Results:
```powershell
# MySQL Network Binding
PS> netstat -an | findstr :3306
TCP    0.0.0.0:3306           0.0.0.0:0              LISTENING  ✅

# Network Connectivity Test
PS> Test-NetConnection -ComputerName 10.6.4.150 -Port 3306
TcpTestSucceeded : True  ✅

# Firewall Rules
PS> Get-NetFirewallRule | Where DisplayName -like "*mysql*"
mysqld         True   Inbound  Allow  ✅
```

### ⚠️ IMPORTANT: IP Address May Change
Your device is using **DHCP**, so the IP `10.6.4.150` may change after router/device restart.

**To fix this permanently:**
1. Set a **static IP** in Windows Network Settings, OR
2. Configure **DHCP reservation** in your router for this device's MAC address

---

## Quick Commands Reference

```powershell
# Check current IP address
Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like "10.*"}

# Check if MySQL port is open
Test-NetConnection -ComputerName 10.6.4.150 -Port 3306

# Verify MySQL is listening on network
netstat -an | findstr :3306

# Test MySQL connection from Device 2
mysql -h 10.6.4.150 -u root -p rmd_dashboard

# View MySQL users
mysql -u root -e "SELECT user, host FROM mysql.user;"

# Restart backend
cd C:\Users\Localuser\Desktop\DashboardMain\backend
taskkill /F /IM node.exe 2>$null
node server.js
```

---

## Network Topology After Setup

```
┌─────────────────────────────────────────┐
│ Device 1 (10.6.7.192)                   │
│ ┌─────────────┐     ┌────────────────┐ │
│ │ Backend API │────▶│ MySQL Database │ │
│ │ :5000       │     │ :3306          │ │
│ └─────────────┘     └────────────────┘ │
│        ▲                    ▲           │
└────────┼────────────────────┼───────────┘
         │                    │
         │                    │ (Network access)
         │                    │
    ┌────┴────────────────────┴────┐
    │                               │
┌───▼───────────┐       ┌───────▼──────────┐
│ Device 2      │       │ Device 3         │
│ Frontend      │       │ Frontend         │
│ API→10.6.7.192│       │ API→10.6.7.192   │
└───────────────┘       └──────────────────┘
```

All devices now share the SAME database on Device 1!
