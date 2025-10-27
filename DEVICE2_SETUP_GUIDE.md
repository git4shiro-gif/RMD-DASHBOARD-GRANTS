# Device 2 Setup Guide - Network Access to Device 1's Data

## 📱 Quick Setup for Other Devices (Same Network)

### Prerequisites:
- ✅ Device 1 running START.ps1
- ✅ Device 2 on same Wi-Fi network
- ✅ Device 1's IP: **10.6.4.150** (check START.ps1 output for current IP)

---

## Method 1: Access via Web Browser Only (NO SETUP NEEDED) ⭐

**Simplest option - no installation required!**

### On Device 2:
1. Open any web browser (Chrome, Edge, Firefox)
2. Go to: **`http://10.6.4.150:5173`** (Device 1's IP)
3. Done! You'll see the full dashboard

**Features:**
- ✅ View all data from Device 1
- ✅ See uploaded CSV data
- ✅ Use all charts and filters
- ✅ No installation needed!

**Limitations:**
- ⚠️ Read-only from Device 2
- ⚠️ Cannot upload CSV from Device 2 (unless you also set up backend)

---

## Method 2: Full Setup with Code Editor (Can Upload CSV)

**For developers who want to edit code and upload CSV on Device 2**

### Step 1: Copy Project Folder
On Device 1:
1. Copy entire folder: `C:\Users\Localuser\Desktop\DashboardMain`
2. Transfer to Device 2 via:
   - USB drive, OR
   - Network share, OR
   - Git push/pull

### Step 2: On Device 2 - Install Dependencies

```powershell
# Navigate to project folder
cd C:\Path\To\DashboardMain\AdminPanel

# Install frontend dependencies
npm install
```

### Step 3: On Device 2 - Update Frontend to Use Device 1's Backend

**Option A: Edit API Base URL in NAFES.jsx**

Open: `AdminPanel\src\pages\grants\NAFES.jsx`

Find line ~80:
```javascript
const API_BASE = 'http://localhost:5000/api/nafes';
```

Change to:
```javascript
const API_BASE = 'http://10.6.4.150:5000/api/nafes';  // Device 1's IP
```

**Option B: Create Environment Variable**

Create `.env` file in `AdminPanel` folder:
```
VITE_API_BASE_URL=http://10.6.4.150:5000
```

Then update code to use:
```javascript
const API_BASE = import.meta.env.VITE_API_BASE_URL + '/api/nafes' || 'http://localhost:5000/api/nafes';
```

### Step 4: On Device 2 - Start Frontend Only

```powershell
cd C:\Path\To\DashboardMain\AdminPanel
npm run dev
```

Now Device 2 frontend connects to Device 1's backend!

---

## Method 3: Full Backend + Frontend on Device 2

**For complete independence - Device 2 connects directly to Device 1's database**

### Step 1-2: Same as Method 2 (copy project + install dependencies)

### Step 3: Install Backend Dependencies on Device 2

```powershell
cd C:\Path\To\DashboardMain\backend
npm install
```

### Step 4: Configure Device 2 Backend to Use Device 1's Database

Edit `backend\.env`:
```
PORT=5000
DB_HOST=10.6.4.150  ← Device 1's IP (where MySQL is running)
DB_USER=root
DB_PASSWORD=
DB_NAME=rmd_dashboard
```

### Step 5: Start Both Servers on Device 2

```powershell
# Terminal 1: Backend
cd C:\Path\To\DashboardMain\backend
node server.js

# Terminal 2: Frontend
cd C:\Path\To\DashboardMain\AdminPanel
npm run dev
```

Now Device 2 has full functionality:
- ✅ Can upload CSV
- ✅ Can view all data
- ✅ Shares same database with Device 1

---

## Troubleshooting

### Issue: "Cannot connect to http://10.6.4.150:5173"

**Check:**
1. Is Device 1's START.ps1 running?
2. Are the PowerShell windows still open on Device 1?
3. Is Device 2 on the same Wi-Fi network?

**Test connectivity:**
```powershell
# From Device 2, run:
Test-NetConnection -ComputerName 10.6.4.150 -Port 5173
Test-NetConnection -ComputerName 10.6.4.150 -Port 5000
```

Should show: `TcpTestSucceeded : True`

---

### Issue: "Device 1 IP changed"

**Solution:**
1. On Device 1, run START.ps1 to see new IP
2. Update Device 2's API URL with new IP
3. Restart Device 2's servers

**Better Solution (Future):**
- Ask IT for DHCP reservation
- Device 1's IP stays permanent

---

### Issue: "Cannot upload CSV from Device 2"

**You need:** Method 3 (full backend on Device 2)

If using Method 1 or 2:
- Device 2 can only VIEW data
- Upload CSV from Device 1 only

---

## Network Topology

```
┌─────────────────────────────────────┐
│  Device 1 (10.6.4.150)              │
│  ┌──────────────┐   ┌─────────────┐│
│  │ Frontend     │   │ Backend     ││
│  │ :5173        │──▶│ :5000       ││
│  └──────────────┘   └──────┬──────┘│
│                             │       │
│                      ┌──────▼──────┐│
│                      │ MySQL       ││
│                      │ :3306       ││
│                      └─────────────┘│
└─────────────────────────────────────┘
          ▲                    ▲
          │                    │
          │ (Method 1)         │ (Method 3)
          │ Web Browser        │ Backend API
          │                    │
┌─────────┴────────────────────┴──────┐
│  Device 2                            │
│  Method 1: Browser → 10.6.4.150:5173│
│  Method 2: Frontend → Backend API   │
│  Method 3: Full Stack → MySQL       │
└──────────────────────────────────────┘
```

---

## Recommended Setup by Use Case

| Use Case | Method | Device 2 Needs |
|----------|--------|----------------|
| **Just view data** | Method 1 | Web browser only |
| **Developer testing** | Method 2 | Node.js, npm, code editor |
| **Upload CSV from Device 2** | Method 3 | Full project setup |
| **Mobile/Tablet** | Method 1 | Browser (Chrome, Safari) |

---

## Quick Test Commands (Device 2)

```powershell
# Test if Device 1's frontend is accessible
curl http://10.6.4.150:5173

# Test if Device 1's backend API is accessible
Invoke-RestMethod -Uri "http://10.6.4.150:5000/api/health"

# Test if Device 1's MySQL is accessible
Test-NetConnection -ComputerName 10.6.4.150 -Port 3306
```

All should succeed if setup is correct!

---

## Current Device 1 Configuration

**IP Address:** `10.6.4.150` (check START.ps1 output if changed)
**Frontend:** http://10.6.4.150:5173
**Backend API:** http://10.6.4.150:5000
**Database:** 10.6.4.150:3306

**Device 2 can access by simply opening:**
👉 **http://10.6.4.150:5173** 👈

No setup required for viewing!
