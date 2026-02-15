-- ============================================
-- UPDATE FIRE DEPARTMENT INFORMATION
-- For: Belgium-Cold Springs Fire District, Alberta Fire Department, Azle Fire Department
-- 
-- DATABASE: PostgreSQL
-- TOOL: TablePlus
-- ============================================

-- ============================================
-- BELGIUM-COLD SPRINGS FIRE DISTRICT (ID: 9)
-- ============================================
UPDATE fire_departments
SET 
    county = 'Onondaga',
    state = 'NY',
    website = 'https://www.belgiumcoldspringsfd.org',
    customer_since = '2000-01-01',
    renewal_date = '2025-12-31',
    valuation_date = '2025-09-29',
    agent = 'McNeil & Company, Inc.'
WHERE fire_department_id = 9
AND fire_department_name = 'Belgium-Cold Springs Fire District';

-- ============================================
-- ALBERTA FIRE DEPARTMENT, CANADA (ID: 7)
-- ============================================
UPDATE fire_departments
SET 
    county = NULL,  -- Province-based, not county
    state = 'Alberta, Canada',
    website = NULL,  -- Add if available
    customer_since = '2015-01-01',  -- Estimated
    renewal_date = '2025-12-31',
    valuation_date = '2025-01-15',
    agent = NULL  -- Add if available
WHERE fire_department_id = 7
AND fire_department_name = 'Alberta Fire Department, Canada';

-- ============================================
-- AZLE FIRE DEPARTMENT, TX (ID: 2)
-- ============================================
UPDATE fire_departments
SET 
    county = 'Tarrant',
    state = 'TX',
    website = NULL,  -- Add if available
    customer_since = '2018-01-01',  -- Estimated
    renewal_date = '2025-12-31',
    valuation_date = '2025-02-01',
    agent = NULL  -- Add if available
WHERE fire_department_id = 2
AND fire_department_name = 'Azle Fire Department, TX';

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check updated fire departments
SELECT 
    fire_department_id,
    fire_department_name,
    county,
    state,
    website,
    customer_since,
    renewal_date,
    valuation_date,
    agent
FROM fire_departments
WHERE fire_department_id IN (9, 7, 2)
ORDER BY fire_department_id;

-- Summary of all fire departments with missing data
SELECT 
    fire_department_id,
    fire_department_name,
    CASE 
        WHEN county IS NULL THEN 'Missing County'
        ELSE 'OK'
    END as county_status,
    CASE 
        WHEN state IS NULL THEN 'Missing State'
        ELSE 'OK'
    END as state_status,
    CASE 
        WHEN customer_since IS NULL THEN 'Missing Customer Since'
        ELSE 'OK'
    END as customer_since_status,
    CASE 
        WHEN renewal_date IS NULL THEN 'Missing Renewal Date'
        ELSE 'OK'
    END as renewal_status
FROM fire_departments
ORDER BY fire_department_id;



