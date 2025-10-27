# GIA Setup Instructions

## ✅ What's Been Done:
1. ✅ Backend routes created (`backend/routes/gia.js`)
2. ✅ Database schema created (`backend/database/gia_schema.sql`)
3. ✅ Frontend updated with API integration (`AdminPanel/src/pages/grants/GIA.jsx`)
4. ✅ Servers restarted

## 📝 Next Steps:

### Step 1: Create the GIA Database Table

1. Open **phpMyAdmin** in your browser:
   - Go to: http://localhost/phpmyadmin
   
2. Click on **`rmd_dashboard`** database (left sidebar)

3. Click the **SQL** tab at the top

4. Copy and paste this SQL (or use the file `backend/database/gia_schema.sql`):

```sql
CREATE TABLE IF NOT EXISTS gia_grants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  count_no VARCHAR(50),
  grant_name VARCHAR(255),
  year_awarded INT,
  uii VARCHAR(50),
  hei_name VARCHAR(255),
  hei_type VARCHAR(100),
  region VARCHAR(50),
  project_title TEXT,
  budget_approved DECIMAL(15, 2),
  priority_area VARCHAR(255),
  psced_field_description VARCHAR(255),
  psced_field_code VARCHAR(50),
  mooe DECIMAL(15, 2),
  co_equipment DECIMAL(15, 2),
  amount_allocated DECIMAL(15, 2),
  amount_obligated DECIMAL(15, 2),
  amount_disbursed DECIMAL(15, 2),
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_year (year_awarded),
  INDEX idx_region (region),
  INDEX idx_priority (priority_area),
  INDEX idx_hei_type (hei_type),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

5. Click **Go** to execute

6. You should see: "Query OK, 0 rows affected"

### Step 2: Upload the GIA CSV Data

1. Open the dashboard: http://localhost:5173

2. Navigate to: **Grants → GIA**

3. Click the **Upload Grant** button

4. Select your **GIA.csv** file from Downloads folder

5. Wait for upload confirmation

6. Page will refresh with real data!

## 🎯 Expected Results:

After uploading the CSV:
- ✅ Summary cards show real GIA grant counts and amounts
- ✅ **Per Priority Area** pie chart shows distribution
- ✅ **Per Year Awarded** bar chart shows trends
- ✅ **Per Region** horizontal bar chart shows regional distribution
- ✅ **Per HEI Type** pie chart shows SUC/Technical/Private breakdown
- ✅ **Status** pie chart shows Ongoing/Completed/Pending
- ✅ **Financial Trends** line chart shows amount over years

## 🔍 Testing the API:

Before uploading CSV, test the endpoints:

```powershell
# Test API health
Invoke-RestMethod http://localhost:5000/api/health

# Test GIA overview (will be empty until CSV uploaded)
Invoke-RestMethod http://localhost:5000/api/gia/overview

# Test yearly trends
Invoke-RestMethod http://localhost:5000/api/gia/yearly-trends
```

## 🌐 Multi-Device Access:

Once setup is complete, all devices can access:
- **Frontend**: http://10.6.4.150:5173 → Grants → GIA
- **Upload CSV**: Only from Device 1
- **View Data**: From any device on the network

## ⚠️ Troubleshooting:

**If table creation fails:**
```sql
-- Check if table already exists
SHOW TABLES LIKE 'gia_grants';

-- If exists and want to recreate:
DROP TABLE IF EXISTS gia_grants;
-- Then run CREATE TABLE again
```

**If API returns errors:**
- Check backend console for error messages
- Verify table was created: `DESCRIBE gia_grants;`
- Check MySQL is running in XAMPP

**If frontend shows "Loading..." forever:**
- Open browser console (F12)
- Check for network errors
- Verify backend is running on port 5000

## 📊 Chart Specifications (Implemented):

✅ Per Priority Area - Pie Chart (projects count)
✅ Per Year Awarded - Bar Chart (projects count)
✅ Per Region - Horizontal Bar Chart (projects count)
✅ Per HEI Type - Pie Chart (projects count)
✅ Status - Pie Chart (projects count)
✅ Financial Trends - Line Chart (amount over years)

---

**Ready to test!** Create the table in phpMyAdmin, then upload your GIA.csv file! 🚀
