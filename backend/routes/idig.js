import express from 'express';
import multer from 'multer';
import csv from 'csv-parser';
import fs from 'fs';
import path from 'path';
import db from '../config/database.js';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Helper function to parse currency strings
function parseCurrency(value) {
  if (!value || value === 'N/A' || value === '') return 0;
  return parseFloat(String(value).replace(/[₱,]/g, '')) || 0;
}

// Helper function to determine HEI type based on name
function determineHEIType(heiName) {
  const name = String(heiName).toUpperCase();
  if (name.includes('STATE UNIVERSITY') || name.includes('STATE COLLEGE')) return 'SUC';
  if (name.includes('TECHNICAL') || name.includes('POLYTECHNIC')) return 'Technical';
  if (name.includes('PRIVATE')) return 'Private';
  return 'Other';
}

// GET /api/idig/overview - Get overview statistics
router.get('/overview', async (req, res) => {
  try {
    const { year } = req.query;
    let query = `
      SELECT 
        COUNT(DISTINCT id) as totalGrants,
        SUM(budget_approved) as totalAmount,
        SUM(amount_released) as totalReleased,
        COUNT(CASE WHEN status = 'Ongoing' THEN 1 END) as activeProjects,
        COUNT(CASE WHEN status = 'Completed' THEN 1 END) as completedProjects
      FROM idig_grants
    `;
    
    const params = [];
    if (year && year !== 'All') {
      query += ' WHERE year_awarded = ?';
      params.push(year);
    }

    const [results] = await db.query(query, params);
    res.json(results[0]);
  } catch (error) {
    console.error('Error fetching IDIG overview:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/idig/priority-area - Get grants by priority area
router.get('/priority-area', async (req, res) => {
  try {
    const { year } = req.query;
    let query = `
      SELECT 
        TRIM(priority_area) as area,
        COUNT(*) as projects,
        SUM(amount_released) as amount
      FROM idig_grants
      WHERE priority_area IS NOT NULL AND priority_area != ''
    `;
    
    const params = [];
    if (year && year !== 'All') {
      query += ' AND year_awarded = ?';
      params.push(year);
    }
    
    query += ' GROUP BY TRIM(priority_area) ORDER BY amount DESC';

    const [results] = await db.query(query, params);
    res.json(results);
  } catch (error) {
    console.error('Error fetching IDIG priority areas:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/idig/yearly-trends - Get trends by year
router.get('/yearly-trends', async (req, res) => {
  try {
    const query = `
      SELECT 
        year_awarded as year,
        COUNT(*) as projects,
        SUM(amount_released) as amount
      FROM idig_grants
      WHERE year_awarded IS NOT NULL
      GROUP BY year_awarded
      ORDER BY year_awarded ASC
    `;

    const [results] = await db.query(query);
    res.json(results);
  } catch (error) {
    console.error('Error fetching IDIG yearly trends:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/idig/region - Get grants by region
router.get('/region', async (req, res) => {
  try {
    const { year } = req.query;
    let query = `
      SELECT 
        TRIM(region) as region,
        COUNT(*) as projects,
        SUM(amount_released) as amount
      FROM idig_grants
      WHERE region IS NOT NULL AND region != ''
    `;
    
    const params = [];
    if (year && year !== 'All') {
      query += ' AND year_awarded = ?';
      params.push(year);
    }
    
    query += ' GROUP BY TRIM(region) ORDER BY region ASC';

    const [results] = await db.query(query, params);
    res.json(results);
  } catch (error) {
    console.error('Error fetching IDIG by region:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/idig/hei-type - Get grants by HEI type
router.get('/hei-type', async (req, res) => {
  try {
    const { year } = req.query;
    let query = `
      SELECT 
        TRIM(hei_type) as type,
        COUNT(*) as projects,
        SUM(amount_released) as amount
      FROM idig_grants
      WHERE hei_type IS NOT NULL AND hei_type != ''
    `;
    
    const params = [];
    if (year && year !== 'All') {
      query += ' AND year_awarded = ?';
      params.push(year);
    }
    
    query += ' GROUP BY TRIM(hei_type) ORDER BY amount DESC';

    const [results] = await db.query(query, params);
    res.json(results);
  } catch (error) {
    console.error('Error fetching IDIG by HEI type:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/idig/status - Get grants by status
router.get('/status', async (req, res) => {
  try {
    const { year } = req.query;
    let query = `
      SELECT 
        status,
        COUNT(*) as projects,
        SUM(amount_released) as amount
      FROM idig_grants
      WHERE status IS NOT NULL AND status != ''
    `;
    
    const params = [];
    if (year && year !== 'All') {
      query += ' AND year_awarded = ?';
      params.push(year);
    }
    
    query += ' GROUP BY status ORDER BY amount DESC';

    const [results] = await db.query(query, params);
    res.json(results);
  } catch (error) {
    console.error('Error fetching IDIG by status:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/idig/upload-csv - Upload and process CSV file
router.post('/upload-csv', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const filePath = req.file.path;
  const replaceAll = req.body.replaceAll === 'true';
  const results = [];
  let recordsProcessed = 0;

  try {
    // If replaceAll is true, delete existing records
    if (replaceAll) {
      await db.query('DELETE FROM idig_grants');
      console.log('Existing IDIG records deleted');
    }

    // Read and parse CSV
    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', resolve)
        .on('error', reject);
    });

    console.log(`Processing ${results.length} IDIG records...`);

    // Process each row
    for (const row of results) {
      const insertQuery = `
        INSERT INTO idig_grants (
          project_id, project_title, year_awarded, hei_name, hei_type, 
          region, priority_area, budget_approved, amount_released,
          status, remarks, start_date, end_date, extension_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        row['Project ID'] || row['project_id'] || null,
        row['Project Title'] || row['project_title'] || null,
        parseInt(row['Year'] || row['year_awarded']) || null,
        row['HEI Name'] || row['hei_name'] || null,
        determineHEIType(row['HEI Name'] || row['hei_name']),
        row['Region'] || row['region'] || null,
        row['Priority Area'] || row['priority_area'] || null,
        parseCurrency(row['Budget'] || row['budget_approved']),
        parseCurrency(row['Amount Released'] || row['amount_released']),
        row['Status'] || row['status'] || null,
        row['Remarks'] || row['remarks'] || null,
        row['Start Date'] || row['start_date'] || null,
        row['End Date'] || row['end_date'] || null,
        row['Extension Date'] || row['extension_date'] || null
      ];

      await db.query(insertQuery, values);
      recordsProcessed++;
    }

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    res.json({
      message: 'IDIG CSV file processed successfully',
      recordsProcessed,
      replaceAll
    });

  } catch (error) {
    console.error('Error processing IDIG CSV:', error);
    // Clean up file on error
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    res.status(500).json({ error: error.message });
  }
});

export default router;