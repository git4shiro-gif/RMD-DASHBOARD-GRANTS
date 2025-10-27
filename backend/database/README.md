# Database Setup Instructions

## Prerequisites
- XAMPP installed with MySQL/MariaDB running
- phpMyAdmin accessible at http://localhost/phpmyadmin

## Setup Steps

1. **Start XAMPP**
   - Open XAMPP Control Panel
   - Start Apache and MySQL services

2. **Create Database**
   - Open phpMyAdmin (http://localhost/phpmyadmin)
   - Click "New" to create a new database
   - Database name: `rmd_dashboard`
   - Collation: `utf8mb4_general_ci`
   - Click "Create"

3. **Import Schema**
   - Select the `rmd_dashboard` database
   - Click "SQL" tab
   - Copy and paste the contents of `schema.sql`
   - Click "Go" to execute

4. **Configure Backend**
   - Update `.env` file in the backend folder:
     ```
     DB_HOST=localhost
     DB_USER=root
     DB_PASSWORD=
     DB_NAME=rmd_dashboard
     ```

5. **Test Connection**
   - Run the backend server: `npm run dev`
   - Visit: http://localhost:5000/api/health
   - Should see: {"status":"OK","message":"RMD Dashboard API is running"}

## Import Sample Data

If you have the NAFES.csv file:
1. Use the upload endpoint via frontend "Upload Grant" button
2. Or use Postman/Thunder Client:
   - POST http://localhost:5000/api/nafes/upload-csv
   - Body: form-data
   - Key: file (type: File)
   - Value: Select NAFES.csv

## Verify Data

After importing, check in phpMyAdmin:
- Select `rmd_dashboard` database
- Click on `nafes_grants` table
- Click "Browse" to see imported data

## API Endpoints

Test these endpoints after data import:
- GET http://localhost:5000/api/nafes/overview
- GET http://localhost:5000/api/nafes/priority-area
- GET http://localhost:5000/api/nafes/yearly-trends
- GET http://localhost:5000/api/nafes/region
- GET http://localhost:5000/api/nafes/hei-type
- GET http://localhost:5000/api/nafes/status
