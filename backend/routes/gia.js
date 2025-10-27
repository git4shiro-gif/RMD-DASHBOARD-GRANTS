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

// Helper function to determine status
function determineStatus(allocated, obligated, disbursed) {
  // Check in reverse order - most advanced stage wins
  if (disbursed > 0) return 'Disbursed';
  if (obligated > 0 && disbursed === 0) return 'Obligated';
  if (allocated > 0 && obligated === 0 && disbursed === 0) return 'Allocated';
  return 'Amount';
}

// GET /api/gia/overview - Get overview statistics
router.get('/overview', async (req, res) => {
  try {
    const { year } = req.query;
    let query = `
      SELECT 
        COUNT(DISTINCT id) as totalGrants,
        SUM(budget_approved) as totalAmount,
        SUM(amount_allocated) as totalAllocated,
        SUM(amount_disbursed) as totalDisbursed,
        COUNT(CASE WHEN status = 'Disbursed' THEN 1 END) as disbursedProjects,
        COUNT(CASE WHEN status = 'Obligated' THEN 1 END) as obligatedProjects,
        COUNT(CASE WHEN status = 'Allocated' THEN 1 END) as allocatedProjects,
        COUNT(CASE WHEN status = 'Amount' THEN 1 END) as amountProjects
      FROM gia_grants
    `;
    
    const params = [];
    if (year && year !== 'All') {
      query += ' WHERE year_awarded = ?';
      params.push(year);
    }

    const [results] = await db.query(query, params);
    res.json(results[0]);
  } catch (error) {
    console.error('Error fetching GIA overview:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/gia/priority-area - Get grants by priority area
router.get('/priority-area', async (req, res) => {
  try {
    const { year } = req.query;
    let query = `
      SELECT 
        TRIM(priority_area) as area,
        COUNT(*) as projects,
        SUM(amount_disbursed) as amount
      FROM gia_grants
      WHERE priority_area IS NOT NULL AND priority_area != ''
        AND hei_type IS NOT NULL AND hei_type != ''
        AND status IS NOT NULL AND status != ''
    `;
    
    const params = [];
    if (year && year !== 'All') {
      query += ' AND year_awarded = ?';
      params.push(year);
    }
    
    query += ' GROUP BY TRIM(priority_area) ORDER BY amount DESC';

    const [results] = await db.query(query, params);
    if (!results || !Array.isArray(results)) {
      res.json([]); // Return empty array if no results
      return;
    }
    res.json(results);
  } catch (error) {
    console.error('Error fetching GIA priority areas:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/gia/yearly-trends - Get trends by year
router.get('/yearly-trends', async (req, res) => {
  try {
    const query = `
      SELECT 
        year_awarded as year,
        COUNT(*) as projects,
        SUM(amount_disbursed) as amount
      FROM gia_grants
      WHERE year_awarded IS NOT NULL
      GROUP BY year_awarded
      ORDER BY year_awarded ASC
    `;

    const [results] = await db.query(query);
    if (!results || !Array.isArray(results)) {
      res.json([]); // Return empty array if no results
      return;
    }
    res.json(results);
  } catch (error) {
    console.error('Error fetching GIA yearly trends:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/gia/region - Get grants by region
router.get('/region', async (req, res) => {
  try {
    const { year } = req.query;
    let query = `
      SELECT 
        TRIM(region) as region,
        COUNT(*) as projects,
        SUM(amount_disbursed) as amount
      FROM gia_grants
      WHERE region IS NOT NULL AND region != ''
        AND priority_area IS NOT NULL AND priority_area != ''
        AND hei_type IS NOT NULL AND hei_type != ''
        AND status IS NOT NULL AND status != ''
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
    console.error('Error fetching GIA by region:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/gia/hei-type - Get grants by HEI type
router.get('/hei-type', async (req, res) => {
  try {
    const { year } = req.query;
    let query = `
      SELECT 
        TRIM(hei_type) as type,
        COUNT(*) as projects,
        SUM(amount_disbursed) as amount
      FROM gia_grants
      WHERE hei_type IS NOT NULL AND hei_type != ''
        AND priority_area IS NOT NULL AND priority_area != ''
        AND status IS NOT NULL AND status != ''
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
    console.error('Error fetching GIA by HEI type:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/gia/status - Get grants by status
router.get('/status', async (req, res) => {
  try {
    const { year } = req.query;
    let query = `
      SELECT 
        status,
        COUNT(*) as projects,
        SUM(amount_disbursed) as amount
      FROM gia_grants
      WHERE status IS NOT NULL AND status != ''
        AND priority_area IS NOT NULL AND priority_area != ''
        AND hei_type IS NOT NULL AND hei_type != ''
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
    console.error('Error fetching GIA by status:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/gia/upload-csv - Upload and process CSV file
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
      await db.query('DELETE FROM gia_grants');
      console.log('Existing GIA records deleted');
    }

    // Read and parse CSV
    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', resolve)
        .on('error', reject);
    });

    console.log(`Processing ${results.length} GIA records...`);

    // Process each row
    for (const row of results) {
      const budgetApproved = parseCurrency(row['AMOUNT'] || row['Amount'] || row['budget_approved']);
      const allocated = parseCurrency(row['ALLOCATED'] || row['Allocated'] || row['amount_allocated']);
      const obligated = parseCurrency(row['OBLIGATED'] || row['Obligated'] || row['amount_obligated']);
      const disbursed = parseCurrency(row['DISBURSED'] || row['Disbursed'] || row['amount_disbursed']);
      const heiType = determineHEIType(row['HEI Name'] || row['hei_name']);
      const status = determineStatus(allocated, obligated, disbursed);

      const insertQuery = `
        INSERT INTO gia_grants (
          count_no, grant_name, year_awarded, uii, hei_name, hei_type, region,
          project_title, budget_approved, priority_area, psced_field_description,
          psced_field_code, mooe, co_equipment, amount_allocated, amount_obligated,
          amount_disbursed, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        row['Count'] || row['count_no'] || null,
        row['Grant'] || row['grant_name'] || 'GIA',
        parseInt(row['Year Awarded'] || row['year_awarded']) || null,
        row['UII'] || row['uii'] || null,
        row['HEI Name'] || row['hei_name'] || null,
        heiType,
        row['Region'] || row['region'] || null,
        row['Project Title'] || row['project_title'] || null,
        budgetApproved,
        row['Priority Area'] || row['priority_area'] || null,
        row['PSCED Detailed Field Description'] || row['psced_field_description'] || null,
        row['PSCED Detailed Field Code'] || row['psced_field_code'] || null,
        parseCurrency(row['MOOE'] || row['mooe']),
        parseCurrency(row['CO (Equipment Outlay)'] || row['co_equipment']),
        allocated,
        obligated,
        disbursed,
        status
      ];

      await db.query(insertQuery, values);
      recordsProcessed++;
    }

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    res.json({
      message: 'GIA CSV file processed successfully',
      recordsProcessed,
      replaceAll
    });

  } catch (error) {
    console.error('Error processing GIA CSV:', error);
    // Clean up file on error
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    res.status(500).json({ error: error.message });
  }
});

export default router;
