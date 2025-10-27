-- RMD Dashboard Database Schema
-- Database: rmd_dashboard

CREATE DATABASE IF NOT EXISTS rmd_dashboard;
USE rmd_dashboard;

-- GIA Grants Table
CREATE TABLE IF NOT EXISTS gia_grants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    count_no VARCHAR(50),
    grant_name VARCHAR(100),
    year_awarded INT,
    uii VARCHAR(100),
    hei_name VARCHAR(255),
    hei_type VARCHAR(50),
    region VARCHAR(50),
    project_title TEXT,
    budget_approved DECIMAL(15,2),
    priority_area VARCHAR(255),
    psced_field_description TEXT,
    psced_field_code VARCHAR(50),
    mooe DECIMAL(15,2),
    co_equipment DECIMAL(15,2),
    amount_allocated DECIMAL(15,2),
    amount_obligated DECIMAL(15,2),
    amount_disbursed DECIMAL(15,2),
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Indexes for GIA table
CREATE INDEX idx_gia_year ON gia_grants(year_awarded);
CREATE INDEX idx_gia_region ON gia_grants(region);
CREATE INDEX idx_gia_status ON gia_grants(status);
CREATE INDEX idx_gia_hei ON gia_grants(hei_name);
CREATE INDEX idx_gia_priority ON gia_grants(priority_area);

-- IDIG Grants Table
CREATE TABLE IF NOT EXISTS idig_grants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id VARCHAR(50) UNIQUE NOT NULL,
    project_title TEXT,
    year_awarded INT,
    hei_name VARCHAR(255),
    hei_type VARCHAR(50),
    region VARCHAR(50),
    priority_area VARCHAR(255),
    budget_approved DECIMAL(15,2),
    amount_released DECIMAL(15,2),
    status VARCHAR(50),
    remarks TEXT,
    start_date DATE,
    end_date DATE,
    extension_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Indexes for IDIG table
CREATE INDEX idx_idig_year ON idig_grants(year_awarded);
CREATE INDEX idx_idig_region ON idig_grants(region);
CREATE INDEX idx_idig_status ON idig_grants(status);
CREATE INDEX idx_idig_hei ON idig_grants(hei_name);
CREATE INDEX idx_idig_priority ON idig_grants(priority_area);

-- NAFES Grants Table
CREATE TABLE IF NOT EXISTS nafes_grants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    control_no VARCHAR(50) UNIQUE NOT NULL,
    incharge VARCHAR(100),
    year_obligated INT,
    year_released INT,
    region VARCHAR(50),
    platform VARCHAR(100),
    hei VARCHAR(255),
    program_title TEXT,
    number_of_projects INT,
    brief_description TEXT,
    objectives TEXT,
    research_platform VARCHAR(255),
    budget_approved DECIMAL(15,2),
    budget_released DECIMAL(15,2),
    lddap_ada_no VARCHAR(100),
    date_obligated DATE,
    date_granted DATE,
    receipt_received VARCHAR(50),
    date_started DATE,
    date_ended DATE,
    extension_start_date DATE,
    extension_end_date DATE,
    duration VARCHAR(50),
    status VARCHAR(50),
    individual_beneficiaries TEXT,
    total_beneficiaries INT,
    collaborating_hei TEXT,
    principal_investigator VARCHAR(255),
    team_members TEXT,
    contact_numbers TEXT,
    email_addresses TEXT,
    ceb_reso_no TEXT,
    field_visit TEXT,
    encoder_remarks TEXT,
    date_submitted_terminal TEXT,
    date_submitted_financial TEXT,
    amount_to_liquidate DECIMAL(15,2),
    remarks TEXT,
    actual_beneficiaries TEXT,
    project_accomplishments TEXT,
    documents TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Indexes for faster queries
CREATE INDEX idx_year_obligated ON nafes_grants(year_obligated);
CREATE INDEX idx_region ON nafes_grants(region);
CREATE INDEX idx_status ON nafes_grants(status);
CREATE INDEX idx_hei ON nafes_grants(hei);
CREATE INDEX idx_platform ON nafes_grants(platform);
