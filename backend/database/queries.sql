-- Sample queries for NAFES data aggregation

-- Get overview statistics
SELECT 
    COUNT(*) as total_grants,
    SUM(budget_approved) as total_amount,
    SUM(CASE WHEN status NOT IN ('Completed', 'Withdrawn') THEN 1 ELSE 0 END) as active_projects,
    SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed_projects
FROM nafes_grants;

-- Get data by research platform (Priority Area)
SELECT 
    research_platform as name,
    COUNT(*) as projects,
    SUM(budget_approved) as amount
FROM nafes_grants
WHERE research_platform IS NOT NULL AND research_platform != ''
GROUP BY research_platform
ORDER BY projects DESC;

-- Get yearly trends
SELECT 
    year_obligated as year,
    COUNT(*) as projects,
    SUM(budget_approved) as amount
FROM nafes_grants
WHERE year_obligated IS NOT NULL
GROUP BY year_obligated
ORDER BY year_obligated;

-- Get data by region
SELECT 
    region,
    COUNT(*) as projects,
    SUM(budget_approved) as amount
FROM nafes_grants
WHERE region IS NOT NULL AND region != ''
GROUP BY region
ORDER BY projects DESC;

-- Get data by HEI type (you'll need to categorize HEIs)
-- This is a simplified version - you may need to update based on actual HEI names
SELECT 
    CASE 
        WHEN hei LIKE '%State University%' OR hei LIKE '%State College%' THEN 'State Universities'
        WHEN hei LIKE '%Polytechnic%' OR hei LIKE '%College%' THEN 'Local Colleges'
        ELSE 'Private HEIs'
    END as name,
    COUNT(*) as projects,
    SUM(budget_approved) as amount
FROM nafes_grants
WHERE hei IS NOT NULL AND hei != ''
GROUP BY name;

-- Get status distribution
SELECT 
    status as name,
    COUNT(*) as value
FROM nafes_grants
WHERE status IS NOT NULL AND status != ''
GROUP BY status
ORDER BY value DESC;
