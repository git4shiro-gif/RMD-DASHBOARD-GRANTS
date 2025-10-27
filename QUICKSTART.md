# RMD Dashboard - Quick Start Guide

## 🚀 How to Start the Dashboard (Every Day)

### ⭐ EASIEST METHOD: Double-Click START.ps1

1. **Navigate** to: `C:\Users\Localuser\Desktop\DashboardMain`
2. **Double-click**: `START.ps1`
3. **Click** "Run" if Windows asks for permission
4. **Wait** for 2 PowerShell windows to open
5. **Open browser**: http://localhost:5173

✅ **The script automatically:**
- Detects your current IP (even if it changed overnight!)
- Updates database configuration
- Starts both backend and frontend servers

---

## 📝 What START.ps1 Does Automatically

```
1. Detect IP:      10.6.4.150 ✓  (or whatever your current IP is)
2. Update .env:    DB_HOST=10.6.4.150 ✓
3. Kill old servers ✓
4. Start Backend ✓
5. Start Frontend ✓
6. Ready to use! ✓
```

**Why this matters:**
- Your IP changes daily (DHCP)
- No manual configuration needed!
- Works after laptop shutdown/restart!

---

## After Laptop Shutdown (Next Day)

**Your IP might change:**
- Yesterday: `10.6.4.150`
- Today: `10.6.2.75` (example)

**Solution: Just run START.ps1 again!**
- It automatically detects new IP
- Updates all config files
- Servers work with new IP

---

## 📡 For Other Devices to Access Your Data

### Device 1 (Your Laptop):
- Runs: `START.ps1`
- Database at: `10.6.4.150:3306` (your current IP)
- Backend API at: `http://10.6.4.150:5000`

### Device 2 (Colleague's Computer):

**Option A: Point to Your Backend API**
1. Check Device 1's current IP (shown in START.ps1 output)
2. Update Device 2's frontend to use your API:
   ```javascript
   const API_BASE = 'http://10.6.4.150:5000/api/nafes';  // Device 1's IP
   ```

**Option B: Connect to Your Database Directly**
1. Copy the `backend` folder to Device 2
2. Edit Device 2's `backend/.env`:
   ```
   DB_HOST=10.6.4.150  ← Device 1's current IP
   ```
3. Run `node server.js` on Device 2

---

## ✅ What's Been Set Up

### Backend (API Server)
- ✅ Database schema for NAFES grants (`nafes_grants` table)
- ✅ CSV upload endpoint with automatic parsing
- ✅ 6 API endpoints for chart data
- ✅ Dependencies installed (multer, csv-parser)
- ✅ Upload folder created
- ✅ MySQL configured for network access (port 3306)

### Frontend (React App)
- ✅ NAFES page updated to fetch real data from API
- ✅ Loading state while fetching data
- ✅ CSV upload functionality integrated
- ✅ Automatic page refresh after upload

---

## 🚀 How to Use

### Step 1: Set Up Database in XAMPP

1. **Start XAMPP**
   - Open XAMPP Control Panel
   - Click "Start" for Apache and MySQL

2. **Create Database**
   - Open phpMyAdmin: http://localhost/phpmyadmin
   - Click "New" on the left sidebar
   - Database name: `rmd_dashboard`
   - Collation: `utf8mb4_general_ci`
   - Click "Create"

3. **Import Schema**
   - Click on `rmd_dashboard` database
   - Go to "SQL" tab
   - Open: `backend/database/schema.sql`
   - Copy all content and paste into SQL tab
   - Click "Go" to execute

### Step 2: Configure Backend

File: `backend/.env` (already configured)
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=rmd_dashboard
```

### Step 3: Start Backend Server

Open a new terminal:
```powershell
cd "c:\Users\Localuser\Desktop\DashboardMain\backend"
npm run dev
```

You should see:
```
Server is running on port 5000
```

### Step 4: Start Frontend (Already Running)

Your frontend should already be running on port 5174.
If not:
```powershell
cd "c:\Users\Localuser\Desktop\DashboardMain\AdminPanel"
npm run dev
```

### Step 5: Upload NAFES CSV Data

1. Visit the NAFES page in your app
2. Click the "Upload Grant" button (📤)
3. Select your `NAFES.csv` file from Downloads
4. Confirm the upload
5. Wait for success message
6. Page will automatically refresh with real data

---

## 🎯 Testing the Integration

### Test Backend API (Before Upload)
Open browser and visit:
- http://localhost:5000/api/health
  - Should show: `{"status":"OK","message":"RMD Dashboard API is running"}`

- http://localhost:5000/api/nafes/overview
  - Should show: Empty data or zeros (no data uploaded yet)

### Test After CSV Upload
After uploading NAFES.csv:
- http://localhost:5000/api/nafes/overview
  - Should show real numbers from your CSV
  
- http://localhost:5000/api/nafes/priority-area
  - Should show grouped data by research platform

### Test Frontend
- Navigate to: http://localhost:5174
- Click "GRANTS AWARDED" → "NAFES"
- Charts should display real data from database

---

## 📊 Data Flow

```
CSV File Upload
    ↓
Backend receives file → Parses CSV → Validates data
    ↓
Inserts into MySQL database (nafes_grants table)
    ↓
Frontend fetches data via API endpoints
    ↓
Charts display real data
```

---

## 🔧 Troubleshooting

### Backend won't start
- Check if port 5000 is available
- Verify XAMPP MySQL is running
- Check `.env` file configuration

### Database connection error
- Verify database `rmd_dashboard` exists in phpMyAdmin
- Check MySQL username/password in `.env`
- Ensure MySQL service is running in XAMPP

### CSV upload fails
- Check file format matches NAFES.csv structure
- Verify backend server is running
- Check browser console for errors
- Ensure `uploads` folder exists in backend

### Charts show no data
- Verify CSV was uploaded successfully
- Check backend API responses in browser
- Look for console errors in browser DevTools
- Verify database has data (check in phpMyAdmin)

### CORS errors
- Backend already configured with CORS
- Ensure backend is running on port 5000
- Check frontend API calls use correct URL

---

## 📁 File Structure

```
DashboardMain/
├── AdminPanel/                    # Frontend
│   └── src/
│       └── pages/
│           └── grants/
│               └── NAFES.jsx      # ✅ Updated to fetch real data
│
└── backend/                       # Backend API
    ├── config/
    │   └── database.js           # MySQL connection
    ├── database/
    │   ├── schema.sql            # Database structure
    │   ├── queries.sql           # Sample queries
    │   └── README.md             # Database setup guide
    ├── routes/
    │   └── nafes.js              # ✅ API endpoints + CSV upload
    ├── uploads/                   # CSV upload folder
    ├── .env                       # Database credentials
    ├── package.json              # ✅ Dependencies added
    └── server.js                 # Express server
```

---

## 🎨 API Endpoints Reference

### Upload CSV
- **POST** `/api/nafes/upload-csv`
- Body: form-data with `file` field
- Response: `{ message, recordsProcessed }`

### Get Chart Data
- **GET** `/api/nafes/overview` - Summary cards data
- **GET** `/api/nafes/priority-area` - Priority area breakdown
- **GET** `/api/nafes/yearly-trends` - Year-by-year trends
- **GET** `/api/nafes/region` - Regional distribution
- **GET** `/api/nafes/hei-type` - HEI type classification
- **GET** `/api/nafes/status` - Project status distribution

---

## 🔄 Next Steps for Other Grants

This same structure can be replicated for:
- GIA grants
- IDIG grants
- LAKAS grants
- PCARI grants
- SALIKHA grants
- DARETO grants

Just create:
1. New table in schema (e.g., `gia_grants`)
2. New route file (e.g., `routes/gia.js`)
3. Update frontend pages to fetch from new endpoints

---

## ✨ Features Implemented

✅ Dynamic data loading from MySQL database
✅ CSV file upload with parsing
✅ Automatic data insertion/update
✅ Real-time chart updates
✅ Loading states
✅ Error handling
✅ Duplicate prevention (ON DUPLICATE KEY UPDATE)
✅ Data aggregation for charts
✅ Responsive API endpoints

---

**Ready to test!** Start both servers and upload your NAFES.csv file. 🚀
