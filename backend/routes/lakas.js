import express from 'express';
import multer from 'multer';
import csv from 'csv-parser';
import fs from 'fs';
import db from '../config/database.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Get LAKAS overview data
router.get('/overview', async (req, res) => {
  try {
    const { year } = req.query;
    let whereClause = `WHERE TRIM(control_no) IS NOT NULL AND TRIM(control_no) != ''`;
    if (year && year !== 'All') {
      whereClause += ` AND year_obligated = ${db.escape(year)}`;
    }
    const [rows] = await db.query(`
      SELECT 
        COUNT(DISTINCT TRIM(control_no)) as totalGrants,
        COALESCE(SUM(budget_approved), 0) as totalAmount,
        COALESCE(SUM(budget_released), 0) as totalReleased,
        SUM(CASE WHEN status NOT IN ('Completed', 'Withdrawn') THEN 1 ELSE 0 END) as activeProjects,
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completedProjects
      FROM lakas_grants
      ${whereClause}
    `);
    const result = {
      ...rows[0],
      totalAmount: parseFloat(rows[0].totalAmount) || 0,
      totalReleased: parseFloat(rows[0].totalReleased) || 0
    };
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get LAKAS priority area data
router.get('/priority-area', async (req, res) => {
  try {
    const { year } = req.query;
    let whereClause = `WHERE TRIM(control_no) IS NOT NULL AND TRIM(control_no) != '' AND research_platform IS NOT NULL AND research_platform != ''`;
    if (year && year !== 'All') {
      whereClause += ` AND year_obligated = ${db.escape(year)}`;
    }
    const [rows] = await db.query(`
      SELECT 
        TRIM(research_platform) as name,
        COUNT(DISTINCT TRIM(control_no)) as projects,
        COALESCE(SUM(budget_approved), 0) as amount,
        COALESCE(SUM(budget_released), 0) as released
      FROM lakas_grants
      ${whereClause}
      GROUP BY TRIM(research_platform)
      ORDER BY projects DESC
    `);
    const formattedRows = rows.map(row => ({
      ...row,
      amount: parseFloat(row.amount) || 0,
      released: parseFloat(row.released) || 0
    }));
    res.json(formattedRows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get LAKAS yearly trends
router.get('/yearly-trends', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        year_obligated as year,
        COUNT(DISTINCT TRIM(control_no)) as projects,
        COALESCE(SUM(budget_approved), 0) as amount,
        COALESCE(SUM(budget_released), 0) as released
      FROM lakas_grants
      WHERE TRIM(control_no) IS NOT NULL AND TRIM(control_no) != ''
        AND year_obligated IS NOT NULL AND year_obligated != ''
      GROUP BY year_obligated
      ORDER BY year_obligated
    `);
    const formattedRows = rows.map(row => ({
      ...row,
      amount: parseFloat(row.amount) || 0,
      released: parseFloat(row.released) || 0
    }));
    res.json(formattedRows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get LAKAS region data
router.get('/region', async (req, res) => {
  try {
    const { year } = req.query;
    let whereClause = `WHERE TRIM(control_no) IS NOT NULL AND TRIM(control_no) != '' AND region IS NOT NULL AND region != ''`;
    if (year && year !== 'All') {
      whereClause += ` AND year_obligated = ${db.escape(year)}`;
    }
    const [rows] = await db.query(`
      SELECT 
        TRIM(region) as region,
        COUNT(DISTINCT TRIM(control_no)) as projects,
        COALESCE(SUM(budget_approved), 0) as amount,
        COALESCE(SUM(budget_released), 0) as released
      FROM lakas_grants
      ${whereClause}
      GROUP BY TRIM(region)
      ORDER BY projects DESC
    `);
    const formattedRows = rows.map(row => ({
      ...row,
      amount: parseFloat(row.amount) || 0,
      released: parseFloat(row.released) || 0
    }));
    res.json(formattedRows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get LAKAS HEI type distribution
router.get('/hei-type', async (req, res) => {
  try {
    const { year } = req.query;
    let whereClause = `WHERE TRIM(control_no) IS NOT NULL AND TRIM(control_no) != '' AND hei IS NOT NULL AND hei != ''`;
    if (year && year !== 'All') {
      whereClause += ` AND year_obligated = ${db.escape(year)}`;
    }
    const [rows] = await db.query(`
      SELECT 
        CASE 
          WHEN hei LIKE '%State University%' OR hei LIKE '%State College%' THEN 'State Universities'
          WHEN hei LIKE '%Polytechnic%' OR hei LIKE '%College%' THEN 'Local Colleges'
          ELSE 'Private HEIs'
        END as name,
        COUNT(DISTINCT TRIM(control_no)) as projects,
        COALESCE(SUM(budget_approved), 0) as amount,
        COALESCE(SUM(budget_released), 0) as released
      FROM lakas_grants
      ${whereClause}
      GROUP BY name
    `);
    const formattedRows = rows.map(row => ({
      ...row,
      amount: parseFloat(row.amount) || 0,
      released: parseFloat(row.released) || 0
    }));
    res.json(formattedRows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get LAKAS status distribution
router.get('/status', async (req, res) => {
  try {
    const { year } = req.query;
    let whereClause = `WHERE TRIM(control_no) IS NOT NULL AND TRIM(control_no) != '' AND status IS NOT NULL AND status != ''`;
    if (year && year !== 'All') {
      whereClause += ` AND year_obligated = ${db.escape(year)}`;
    }
    const [rows] = await db.query(`
      SELECT 
        TRIM(status) as name,
        COUNT(DISTINCT TRIM(control_no)) as value
      FROM lakas_grants
      ${whereClause}
      GROUP BY TRIM(status)
      ORDER BY value DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload CSV file and import data
router.post('/upload-csv', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const results = [];
    const filePath = req.file.path;
    const replaceAll = req.body.replaceAll === 'true';
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          if (replaceAll) {
            await db.query('DELETE FROM lakas_grants');
          }
\d.-]/g, '') || 0);
\d.-]/g, '') || 0);
          for (const row of results) {
            const budgetApproved = parseFloat(row['BUDGET APPROVED ']?.replace(/[^\d.-]/g, '') || 0);
            const budgetReleased = parseFloat(row['BUDGET RELEASED']?.replace(/[^\d.-]/g, '') || 0);
            await db.query(`
              INSERT INTO lakas_grants (
                control_no, incharge, year_obligated, year_released, region, platform, hei,
                program_title, number_of_projects, brief_description, objectives, research_platform,
                budget_approved, budget_released, lddap_ada_no, date_obligated, date_granted,
                receipt_received, date_started, date_ended, extension_start_date, extension_end_date,
                duration, status, individual_beneficiaries, total_beneficiaries, collaborating_hei,
                principal_investigator, team_members, contact_numbers, email_addresses, ceb_reso_no,
                field_visit, encoder_remarks, date_submitted_terminal, date_submitted_financial,
                amount_to_liquidate, remarks, actual_beneficiaries, project_accomplishments, documents
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              ON DUPLICATE KEY UPDATE
                incharge = VALUES(incharge),
                year_obligated = VALUES(year_obligated),
                region = VALUES(region),
                platform = VALUES(platform),
                hei = VALUES(hei),
                budget_approved = VALUES(budget_approved),
                status = VALUES(status),
                updated_at = CURRENT_TIMESTAMP
            `, [
              row['Control No.'], row['Incharge'], row['YEAR OBLIGATED'], row['YEAR RELEASED'],
              row['REG'], row['NUCAF/PIAF/ASSAP'], row['HEI'], row['PROGRAM/PROJECT TITLE\n(With Link to Documents)'],
              row['NUMBER OF PROJECTS'], row['BRIEF DESCRIPTION / RATIONALE'], row['OBJECTIVES'],
              row['CHED RESEARCH PLATFORM'], budgetApproved, budgetReleased, row['LDDAP-ADA NO.'],
              row['DATE OBLIGATED'], row['DATE GRANTED'], row['Receipt Received'], row['DATE STARTED'],
              row['DATE ENDED'], row['EXTENSION START DATE'], row['EXTENSION END DATE'], row['DURATION'],
              row['STATUS'], row['INDIVIDUAL BENEFICIARIES'], row['TOTAL NO. OF INDIVIDUAL BENEFICIARIES'],
              row['COLLABORATING HEI/S'], row['NAME OF PRINCIPAL INVESTIGATOR/S'], row['TEAM MEMBER/S'],
              row['CONTACT NUMBER/S'], row['EMAIL ADDRESS/ES'], row['CEB RESO NO. APPROVAL'],
              row['M&E FIELD VISIT'], row['OTHER ENCODER REMARKS'], row['Date Submitted Terminal Report? (with soft copy)'],
              row['Date Submitted Financial Report?'], row['Amount to Liquidate'], row['Remarks'],
              row['Actual Beneficiaries'], row['Project Accomplishments/Highlights'], row['Documents']
            ]);
          }
          fs.unlinkSync(filePath);
          res.json({ 
            message: 'CSV uploaded successfully', 
            recordsProcessed: results.length 
          });
        } catch (dbError) {
          fs.unlinkSync(filePath);
          res.status(500).json({ error: 'Database error: ' + dbError.message });
        }
      })
      .on('error', (error) => {
        fs.unlinkSync(filePath);
        res.status(500).json({ error: 'CSV parsing error: ' + error.message });
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
