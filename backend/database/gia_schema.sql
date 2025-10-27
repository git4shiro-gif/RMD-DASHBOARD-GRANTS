-- GIA (Grants-in-Aid) Database Schema
-- Separate database to avoid collision with NAFES

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
