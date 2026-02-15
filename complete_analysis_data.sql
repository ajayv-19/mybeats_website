-- ============================================
-- COMPLETE ANALYSIS DATA SETUP
-- For: Belgium-Cold Springs Fire District, Alberta Fire Department, Azle Fire Department
-- Includes: Fire Department Profile, 5 Years Underwriting Data, and Calculated Analysis Results
-- 
-- DATABASE: PostgreSQL
-- TOOL: TablePlus (or any PostgreSQL client)
-- 
-- INSTRUCTIONS FOR TABLEPLUS:
-- 1. Open TablePlus and connect to your PostgreSQL database
-- 2. Open a new Query tab (Cmd+T on Mac, Ctrl+T on Windows)
-- 3. Copy and paste this entire file into the query editor
-- 4. Execute the query (Cmd+Enter on Mac, Ctrl+Enter on Windows)
--    OR run sections separately by selecting specific parts
-- 5. Check the verification queries at the end to confirm data was inserted
-- 
-- NOTE: This script uses PostgreSQL DO blocks for variable handling.
-- If you get errors about company IDs, make sure FPI, FDI, and FDM exist in Subscribed_Companies table.
-- ============================================

-- ============================================
-- STEP 1: Ensure Lookup Tables Exist
-- ============================================
-- Run this first if lookup tables are not populated

-- Loss Ratio Points
INSERT INTO lookup_loss_ratio_points (min_value, max_value, points) VALUES
(0.00, 10.00, 22), (11.00, 20.00, 20), (21.00, 30.00, 18),
(31.00, 40.00, 16), (41.00, 50.00, 14), (51.00, 60.00, 12),
(61.00, 70.00, 10), (71.00, 80.00, 8), (81.00, 90.00, 6),
(91.00, 100.00, 4), (101.00, 1000.00, 0)
ON CONFLICT DO NOTHING;

-- Density Points
INSERT INTO lookup_density_points (min_value, max_value, points) VALUES
(0, 500, 4), (501, 1500, 3), (1501, 3000, 2),
(3001, 5000, 1), (5001, 15000, 0)
ON CONFLICT DO NOTHING;

-- Call Volume Points
INSERT INTO lookup_call_volume_points (min_value, max_value, points) VALUES
(0, 250, 5), (251, 500, 4), (501, 1000, 3),
(1001, 1500, 2), (1501, 2000, 1), (2001, 10000, 0)
ON CONFLICT DO NOTHING;

-- Frequency Points
INSERT INTO lookup_frequency_points (min_value, max_value, points) VALUES
(0.00, 0.75, 5), (0.76, 1.50, 4), (1.51, 2.25, 3),
(2.26, 3.00, 2), (3.01, 3.75, 1), (3.76, 4.50, 0),
(4.51, 5.25, -1), (5.26, 6.00, -2), (6.01, 6.75, -3),
(6.76, 7.50, -4), (7.51, 8.25, -5), (8.26, 9.00, -6),
(9.01, 9.75, -7), (9.76, 10.50, -8), (10.51, 11.25, -9),
(11.26, 9999.99, -10)
ON CONFLICT DO NOTHING;

-- ============================================
-- STEP 2: Get Company IDs (FPI, FDI, FDM)
-- ============================================
-- These will be used for company assignment
-- Note: Replace with actual company IDs if different

-- ============================================
-- STEP 3: BELGIUM-COLD SPRINGS FIRE DISTRICT
-- ============================================

-- 3.1: Fire Department Profile
INSERT INTO fire_department_profile (
    fire_department_id,
    population,
    square_miles,
    fire_calls,
    ems_calls,
    motorized_racing_team,
    hs_officers,
    safety_committee,
    effective_from,
    effective_to,
    updated_by
) 
SELECT 
    9,  -- Belgium-Cold Springs Fire District (from your screenshot)
    9500,      -- Population
    13.7,      -- Square miles
    269,       -- Fire calls
    669,       -- EMS calls
    false,     -- No racing team
    3,         -- 3 H&S officers
    true,      -- Has safety committee
    CURRENT_DATE,
    NULL,      -- Current profile
    'system'
FROM fire_departments
WHERE fire_department_id = 9
ON CONFLICT (fire_department_id, effective_from) DO UPDATE
SET population = EXCLUDED.population,
    square_miles = EXCLUDED.square_miles,
    fire_calls = EXCLUDED.fire_calls,
    ems_calls = EXCLUDED.ems_calls,
    motorized_racing_team = EXCLUDED.motorized_racing_team,
    hs_officers = EXCLUDED.hs_officers,
    safety_committee = EXCLUDED.safety_committee;

-- 3.2: Underwriting Data (5 Years)
-- Year 2024-2025
INSERT INTO underwriting (
    fire_department_id, company_id, underwriting_year,
    vfbl, wc, total_premium, losses, lae,
    total_loss_lae, loss_ratio, number_of_claims, pr_factor
) VALUES (
    9, 496, '2024-2025',
    50894.00, 20355.00, 71249.00,
    NULL, NULL, NULL, 0.00, 0, 1.000
)
ON CONFLICT (fire_department_id, underwriting_year) DO UPDATE
SET vfbl = EXCLUDED.vfbl, wc = EXCLUDED.wc,
    total_premium = EXCLUDED.total_premium,
    loss_ratio = EXCLUDED.loss_ratio,
    number_of_claims = EXCLUDED.number_of_claims,
    pr_factor = EXCLUDED.pr_factor;

-- Year 2023-2024
INSERT INTO underwriting (
    fire_department_id, company_id, underwriting_year,
    vfbl, wc, total_premium, losses, lae,
    total_loss_lae, loss_ratio, number_of_claims
) VALUES (
    9, 496, '2023-2024',
    46925.00, 15130.00, 62055.00,
    14030.00, 4000.00, 18030.00, 29.06, 1
)
ON CONFLICT (fire_department_id, underwriting_year) DO UPDATE
SET vfbl = EXCLUDED.vfbl, wc = EXCLUDED.wc,
    total_premium = EXCLUDED.total_premium,
    losses = EXCLUDED.losses, lae = EXCLUDED.lae,
    total_loss_lae = EXCLUDED.total_loss_lae,
    loss_ratio = EXCLUDED.loss_ratio,
    number_of_claims = EXCLUDED.number_of_claims;

-- Year 2022-2023
INSERT INTO underwriting (
    fire_department_id, company_id, underwriting_year,
    vfbl, wc, total_premium, losses, lae,
    total_loss_lae, loss_ratio, number_of_claims
) VALUES (
    9, 496, '2022-2023',
    47183.00, 1936.00, 49119.00,
    1162.00, 55.00, 1217.00, 2.48, 2
)
ON CONFLICT (fire_department_id, underwriting_year) DO UPDATE
SET vfbl = EXCLUDED.vfbl, wc = EXCLUDED.wc,
    total_premium = EXCLUDED.total_premium,
    losses = EXCLUDED.losses, lae = EXCLUDED.lae,
    total_loss_lae = EXCLUDED.total_loss_lae,
    loss_ratio = EXCLUDED.loss_ratio,
    number_of_claims = EXCLUDED.number_of_claims;

-- Year 2021-2022
INSERT INTO underwriting (
    fire_department_id, company_id, underwriting_year,
    vfbl, wc, total_premium, losses, lae,
    total_loss_lae, loss_ratio, number_of_claims
) VALUES (
    9, 496, '2021-2022',
    45921.00, 2889.00, 48810.00,
    6527.00, 3250.00, 9777.00, 20.03, 1
)
ON CONFLICT (fire_department_id, underwriting_year) DO UPDATE
SET vfbl = EXCLUDED.vfbl, wc = EXCLUDED.wc,
    total_premium = EXCLUDED.total_premium,
    losses = EXCLUDED.losses, lae = EXCLUDED.lae,
    total_loss_lae = EXCLUDED.total_loss_lae,
    loss_ratio = EXCLUDED.loss_ratio,
    number_of_claims = EXCLUDED.number_of_claims;

-- Year 2020-2021
INSERT INTO underwriting (
    fire_department_id, company_id, underwriting_year,
    vfbl, wc, total_premium, losses, lae,
    total_loss_lae, loss_ratio, number_of_claims
) VALUES (
    9, 496, '2020-2021',
    46025.00, 3337.00, 49362.00,
    1140.00, 44.00, 1184.00, 2.40, 2
)
ON CONFLICT (fire_department_id, underwriting_year) DO UPDATE
SET vfbl = EXCLUDED.vfbl, wc = EXCLUDED.wc,
    total_premium = EXCLUDED.total_premium,
    losses = EXCLUDED.losses, lae = EXCLUDED.lae,
    total_loss_lae = EXCLUDED.total_loss_lae,
    loss_ratio = EXCLUDED.loss_ratio,
    number_of_claims = EXCLUDED.number_of_claims;

-- 3.3: Calculate and Store Analysis Results for 2023-2024
-- Calculation Details:
-- Loss Ratio: 29.06% → 18 points (21-30 range)
-- Density: 9500 / 13.7 = 693 → 3 points (501-1500 range)
-- Call Volume: 269 + 669 = 938 → 3 points (501-1000 range)
-- Frequency: (1 claim / 62055 premium) * 100000 = 1.61 → 4 points (1.51-2.25 range)
-- Safety: 1 point (has committee)
-- H&S Officers: 3 → 3 points (max 3)
-- Racing Penalty: 0 (no racing team)
-- Total: 18 + 3 + 3 + 4 + 1 + 3 + 0 = 32 points → FPI (26-31 range)

-- Get FPI company ID
DO $$
DECLARE
    fpi_company_id INTEGER;
    fdi_company_id INTEGER;
    fdm_company_id INTEGER;
BEGIN
    -- Get company IDs
    SELECT id INTO fpi_company_id FROM "Subscribed_Companies" WHERE "Company_Name" = 'FPI' LIMIT 1;
    SELECT id INTO fdi_company_id FROM "Subscribed_Companies" WHERE "Company_Name" = 'FDI' LIMIT 1;
    SELECT id INTO fdm_company_id FROM "Subscribed_Companies" WHERE "Company_Name" = 'FDM' LIMIT 1;
    
    -- If companies don't exist, use default company_id 496
    IF fpi_company_id IS NULL THEN fpi_company_id := 496; END IF;
    IF fdi_company_id IS NULL THEN fdi_company_id := 496; END IF;
    IF fdm_company_id IS NULL THEN fdm_company_id := 496; END IF;

    -- Insert Analysis Result for 2023-2024
    INSERT INTO underwriting_results (
        fire_department_id, underwriting_year,
        loss_ratio_points, density_points, call_volume_points,
        frequency_factor_points, safety_points, hso_points,
        racing_penalty, adjustments, total_points, assigned_company_id
    ) VALUES (
        9, '2023-2024',
        18,  -- Loss ratio points (29.06% falls in 21-30% range = 18 points)
        3,   -- Density points (693 falls in 501-1500 range = 3 points)
        3,   -- Call volume points (938 falls in 501-1000 range = 3 points)
        4,   -- Frequency points (1.61 claims/100k falls in 1.51-2.25 range = 4 points)
        1,   -- Safety points (has safety committee)
        3,   -- H&S officers points (3 officers, max 3)
        0,   -- Racing penalty (no racing team)
        0,   -- Adjustments
        32,  -- Total points (18+3+3+4+1+3+0)
        fpi_company_id  -- Assigned to FPI (32 points falls in 26-31 range)
    )
    ON CONFLICT (fire_department_id, underwriting_year) DO UPDATE
    SET loss_ratio_points = EXCLUDED.loss_ratio_points,
        density_points = EXCLUDED.density_points,
        call_volume_points = EXCLUDED.call_volume_points,
        frequency_factor_points = EXCLUDED.frequency_factor_points,
        safety_points = EXCLUDED.safety_points,
        hso_points = EXCLUDED.hso_points,
        racing_penalty = EXCLUDED.racing_penalty,
        adjustments = EXCLUDED.adjustments,
        total_points = EXCLUDED.total_points,
        assigned_company_id = EXCLUDED.assigned_company_id;

    -- Update underwriting row with points and company
    UPDATE underwriting
    SET points = 32, company_id = fpi_company_id
    WHERE fire_department_id = 9 AND underwriting_year = '2023-2024';

    -- Create/Update Policy
    INSERT INTO policies (
        fire_department_id, underwriting_year, assigned_company_id
    ) VALUES (
        9, '2023-2024', fpi_company_id
    )
    ON CONFLICT (fire_department_id, underwriting_year) DO UPDATE
    SET assigned_company_id = EXCLUDED.assigned_company_id;
END $$;

-- ============================================
-- STEP 4: ALBERTA FIRE DEPARTMENT, CANADA
-- ============================================

-- 4.1: Fire Department Profile
-- Assuming fire_department_id = 7 (from your screenshot)
INSERT INTO fire_department_profile (
    fire_department_id,
    population,
    square_miles,
    fire_calls,
    ems_calls,
    motorized_racing_team,
    hs_officers,
    safety_committee,
    effective_from,
    effective_to,
    updated_by
) 
SELECT 
    7,  -- Alberta Fire Department
    12000,     -- Population
    25.0,      -- Square miles
    180,       -- Fire calls
    420,       -- EMS calls
    false,     -- No racing team
    2,         -- 2 H&S officers
    true,      -- Has safety committee
    CURRENT_DATE,
    NULL,
    'system'
FROM fire_departments
WHERE fire_department_id = 7
ON CONFLICT (fire_department_id, effective_from) DO UPDATE
SET population = EXCLUDED.population,
    square_miles = EXCLUDED.square_miles,
    fire_calls = EXCLUDED.fire_calls,
    ems_calls = EXCLUDED.ems_calls,
    motorized_racing_team = EXCLUDED.motorized_racing_team,
    hs_officers = EXCLUDED.hs_officers,
    safety_committee = EXCLUDED.safety_committee;

-- 4.2: Underwriting Data (5 Years)
INSERT INTO underwriting (fire_department_id, company_id, underwriting_year, vfbl, wc, total_premium, losses, lae, total_loss_lae, loss_ratio, number_of_claims) VALUES
(7, 496, '2024-2025', 42000.00, 18000.00, 60000.00, NULL, NULL, NULL, 0.00, 0),
(7, 496, '2023-2024', 41000.00, 17000.00, 58000.00, 8500.00, 2000.00, 10500.00, 18.10, 2),
(7, 496, '2022-2023', 40000.00, 16000.00, 56000.00, 3000.00, 500.00, 3500.00, 6.25, 1),
(7, 496, '2021-2022', 39000.00, 15000.00, 54000.00, 7200.00, 1800.00, 9000.00, 16.67, 1),
(7, 496, '2020-2021', 38000.00, 14000.00, 52000.00, 2000.00, 300.00, 2300.00, 4.42, 1)
ON CONFLICT (fire_department_id, underwriting_year) DO UPDATE
SET vfbl = EXCLUDED.vfbl, wc = EXCLUDED.wc, total_premium = EXCLUDED.total_premium,
    losses = EXCLUDED.losses, lae = EXCLUDED.lae, total_loss_lae = EXCLUDED.total_loss_lae,
    loss_ratio = EXCLUDED.loss_ratio, number_of_claims = EXCLUDED.number_of_claims;

-- 4.3: Calculate and Store Analysis Results for 2023-2024
-- Calculation Details:
-- Loss Ratio: 18.10% → 20 points (11-20% range)
-- Density: 12000 / 25.0 = 480 → 4 points (0-500 range)
-- Call Volume: 180 + 420 = 600 → 3 points (501-1000 range)
-- Frequency: (2 claims / 58000 premium) * 100000 = 3.45 → 1 point (3.01-3.75 range)
-- Safety: 1 point
-- H&S Officers: 2 → 2 points
-- Racing Penalty: 0
-- Total: 20 + 4 + 3 + 1 + 1 + 2 + 0 = 31 points → FPI (26-31 range)

DO $$
DECLARE
    fpi_company_id INTEGER;
BEGIN
    SELECT id INTO fpi_company_id FROM "Subscribed_Companies" WHERE "Company_Name" = 'FPI' LIMIT 1;
    IF fpi_company_id IS NULL THEN fpi_company_id := 496; END IF;

    INSERT INTO underwriting_results (
        fire_department_id, underwriting_year,
        loss_ratio_points, density_points, call_volume_points,
        frequency_factor_points, safety_points, hso_points,
        racing_penalty, adjustments, total_points, assigned_company_id
    ) VALUES (
        7, '2023-2024',
        20, 4, 3, 1, 1, 2, 0, 0, 31, fpi_company_id
    )
    ON CONFLICT (fire_department_id, underwriting_year) DO UPDATE
    SET loss_ratio_points = EXCLUDED.loss_ratio_points,
        density_points = EXCLUDED.density_points,
        call_volume_points = EXCLUDED.call_volume_points,
        frequency_factor_points = EXCLUDED.frequency_factor_points,
        safety_points = EXCLUDED.safety_points,
        hso_points = EXCLUDED.hso_points,
        racing_penalty = EXCLUDED.racing_penalty,
        adjustments = EXCLUDED.adjustments,
        total_points = EXCLUDED.total_points,
        assigned_company_id = EXCLUDED.assigned_company_id;

    UPDATE underwriting
    SET points = 31, company_id = fpi_company_id
    WHERE fire_department_id = 7 AND underwriting_year = '2023-2024';

    INSERT INTO policies (fire_department_id, underwriting_year, assigned_company_id)
    VALUES (7, '2023-2024', fpi_company_id)
    ON CONFLICT (fire_department_id, underwriting_year) DO UPDATE
    SET assigned_company_id = EXCLUDED.assigned_company_id;
END $$;

-- ============================================
-- STEP 5: AZLE FIRE DEPARTMENT, TX
-- ============================================

-- 5.1: Fire Department Profile
-- Assuming fire_department_id = 2 (from your screenshot)
INSERT INTO fire_department_profile (
    fire_department_id,
    population,
    square_miles,
    fire_calls,
    ems_calls,
    motorized_racing_team,
    hs_officers,
    safety_committee,
    effective_from,
    effective_to,
    updated_by
) 
SELECT 
    2,  -- Azle Fire Department
    15000,     -- Population
    8.5,       -- Square miles
    320,       -- Fire calls
    580,       -- EMS calls
    true,      -- Has racing team (penalty)
    1,         -- 1 H&S officer
    false,     -- No safety committee
    CURRENT_DATE,
    NULL,
    'system'
FROM fire_departments
WHERE fire_department_id = 2
ON CONFLICT (fire_department_id, effective_from) DO UPDATE
SET population = EXCLUDED.population,
    square_miles = EXCLUDED.square_miles,
    fire_calls = EXCLUDED.fire_calls,
    ems_calls = EXCLUDED.ems_calls,
    motorized_racing_team = EXCLUDED.motorized_racing_team,
    hs_officers = EXCLUDED.hs_officers,
    safety_committee = EXCLUDED.safety_committee;

-- 5.2: Underwriting Data (5 Years)
INSERT INTO underwriting (fire_department_id, company_id, underwriting_year, vfbl, wc, total_premium, losses, lae, total_loss_lae, loss_ratio, number_of_claims) VALUES
(2, 496, '2024-2025', 55000.00, 22000.00, 77000.00, NULL, NULL, NULL, 0.00, 0),
(2, 496, '2023-2024', 54000.00, 21000.00, 75000.00, 15000.00, 3500.00, 18500.00, 24.67, 3),
(2, 496, '2022-2023', 53000.00, 20000.00, 73000.00, 5000.00, 800.00, 5800.00, 7.95, 1),
(2, 496, '2021-2022', 52000.00, 19000.00, 71000.00, 12000.00, 2800.00, 14800.00, 20.85, 2),
(2, 496, '2020-2021', 51000.00, 18000.00, 69000.00, 3000.00, 600.00, 3600.00, 5.22, 1)
ON CONFLICT (fire_department_id, underwriting_year) DO UPDATE
SET vfbl = EXCLUDED.vfbl, wc = EXCLUDED.wc, total_premium = EXCLUDED.total_premium,
    losses = EXCLUDED.losses, lae = EXCLUDED.lae, total_loss_lae = EXCLUDED.total_loss_lae,
    loss_ratio = EXCLUDED.loss_ratio, number_of_claims = EXCLUDED.number_of_claims;

-- 5.3: Calculate and Store Analysis Results for 2023-2024
-- Calculation Details:
-- Loss Ratio: 24.67% → 18 points (21-30% range)
-- Density: 15000 / 8.5 = 1765 → 2 points (1501-3000 range)
-- Call Volume: 320 + 580 = 900 → 3 points (501-1000 range)
-- Frequency: (3 claims / 75000 premium) * 100000 = 4.0 → 0 points (3.76-4.50 range)
-- Safety: 0 points (no committee)
-- H&S Officers: 1 → 1 point
-- Racing Penalty: -1 (has racing team)
-- Total: 18 + 2 + 3 + 0 + 0 + 1 - 1 = 23 points → FDI (15-25 range)

DO $$
DECLARE
    fdi_company_id INTEGER;
BEGIN
    SELECT id INTO fdi_company_id FROM "Subscribed_Companies" WHERE "Company_Name" = 'FDI' LIMIT 1;
    IF fdi_company_id IS NULL THEN fdi_company_id := 496; END IF;

    INSERT INTO underwriting_results (
        fire_department_id, underwriting_year,
        loss_ratio_points, density_points, call_volume_points,
        frequency_factor_points, safety_points, hso_points,
        racing_penalty, adjustments, total_points, assigned_company_id
    ) VALUES (
        2, '2023-2024',
        18, 2, 3, 0, 0, 1, -1, 0, 23, fdi_company_id
    )
    ON CONFLICT (fire_department_id, underwriting_year) DO UPDATE
    SET loss_ratio_points = EXCLUDED.loss_ratio_points,
        density_points = EXCLUDED.density_points,
        call_volume_points = EXCLUDED.call_volume_points,
        frequency_factor_points = EXCLUDED.frequency_factor_points,
        safety_points = EXCLUDED.safety_points,
        hso_points = EXCLUDED.hso_points,
        racing_penalty = EXCLUDED.racing_penalty,
        adjustments = EXCLUDED.adjustments,
        total_points = EXCLUDED.total_points,
        assigned_company_id = EXCLUDED.assigned_company_id;

    UPDATE underwriting
    SET points = 23, company_id = fdi_company_id
    WHERE fire_department_id = 2 AND underwriting_year = '2023-2024';

    INSERT INTO policies (fire_department_id, underwriting_year, assigned_company_id)
    VALUES (2, '2023-2024', fdi_company_id)
    ON CONFLICT (fire_department_id, underwriting_year) DO UPDATE
    SET assigned_company_id = EXCLUDED.assigned_company_id;
END $$;

-- ============================================
-- STEP 6: VERIFICATION QUERIES
-- ============================================

-- Verify Fire Department Profiles
SELECT 
    fd.fire_department_id,
    fd.fire_department_name,
    fdp.population,
    fdp.square_miles,
    ROUND(fdp.population / NULLIF(fdp.square_miles, 0), 2) as density,
    fdp.fire_calls,
    fdp.ems_calls,
    (fdp.fire_calls + fdp.ems_calls) as total_calls,
    fdp.hs_officers,
    fdp.safety_committee,
    fdp.motorized_racing_team
FROM fire_departments fd
LEFT JOIN fire_department_profile fdp ON fd.fire_department_id = fdp.fire_department_id
WHERE fd.fire_department_id IN (9, 7, 2)
ORDER BY fd.fire_department_id;

-- Verify Underwriting Data
SELECT 
    uw.fire_department_id,
    fd.fire_department_name,
    uw.underwriting_year,
    uw.vfbl,
    uw.wc,
    uw.total_premium,
    uw.losses,
    uw.lae,
    uw.total_loss_lae,
    ROUND(uw.loss_ratio, 2) as loss_ratio,
    uw.number_of_claims,
    uw.points,
    c."Company_Name" as assigned_company
FROM underwriting uw
JOIN fire_departments fd ON uw.fire_department_id = fd.fire_department_id
LEFT JOIN "Subscribed_Companies" c ON uw.company_id = c.id
WHERE uw.fire_department_id IN (9, 7, 2)
ORDER BY uw.fire_department_id, uw.underwriting_year DESC;

-- Verify Analysis Results
SELECT 
    ur.fire_department_id,
    fd.fire_department_name,
    ur.underwriting_year,
    ur.loss_ratio_points,
    ur.density_points,
    ur.call_volume_points,
    ur.frequency_factor_points,
    ur.safety_points,
    ur.hso_points,
    ur.racing_penalty,
    ur.adjustments,
    ur.total_points,
    c."Company_Name" as assigned_company
FROM underwriting_results ur
JOIN fire_departments fd ON ur.fire_department_id = fd.fire_department_id
LEFT JOIN "Subscribed_Companies" c ON ur.assigned_company_id = c.id
WHERE ur.fire_department_id IN (9, 7, 2)
ORDER BY ur.fire_department_id, ur.underwriting_year DESC;

-- Summary by Fire Department
SELECT 
    fd.fire_department_name,
    COUNT(DISTINCT uw.underwriting_year) as years_of_data,
    COUNT(DISTINCT ur.underwriting_year) as years_analyzed,
    MAX(ur.total_points) as max_points,
    MAX(c."Company_Name") as latest_assigned_company
FROM fire_departments fd
LEFT JOIN underwriting uw ON fd.fire_department_id = uw.fire_department_id
LEFT JOIN underwriting_results ur ON fd.fire_department_id = ur.fire_department_id
LEFT JOIN "Subscribed_Companies" c ON ur.assigned_company_id = c.id
WHERE fd.fire_department_id IN (9, 7, 2)
GROUP BY fd.fire_department_id, fd.fire_department_name;

