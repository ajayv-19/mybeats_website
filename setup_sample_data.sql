-- ============================================
-- SETUP SAMPLE DATA FOR ANALYSIS TESTING
-- Run these queries in order
-- ============================================

-- ============================================
-- STEP 1: Find your Company ID
-- ============================================
SELECT id, "Company_Name" FROM "Subscribed_Companies" WHERE id = 496;
-- Note: Replace 496 with your actual company_id if different

-- ============================================
-- STEP 2: Insert Lookup Tables (Run First!)
-- ============================================

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
-- STEP 3: Insert Fire Department
-- ============================================
-- Replace 496 with your company_id from Step 1
INSERT INTO fire_departments (
    company_id, fire_department_name, county, state,
    customer_since, renewal_date, agent
) VALUES (
    496,  -- ⚠️ CHANGE THIS to your company_id
    'Belgium-Cold Springs Fire District',
    'Onondaga',
    'NY',
    '2000-01-01',
    '2025-12-31',
    'McNeil & Company, Inc.'
)
RETURNING fire_department_id;
-- ⚠️ NOTE THE fire_department_id RETURNED - you'll need it for next steps

-- ============================================
-- STEP 4: Insert Fire Department Profile
-- ============================================
-- Replace 1 with the fire_department_id from Step 3
INSERT INTO fire_department_profile (
    fire_department_id, population, square_miles,
    fire_calls, ems_calls, motorized_racing_team,
    hs_officers, safety_committee, effective_from
) VALUES (
    1,  -- ⚠️ CHANGE THIS to fire_department_id from Step 3
    9500,      -- Population
    13.7,      -- Square miles
    269,       -- Fire calls
    669,       -- EMS calls
    false,     -- No racing team
    3,         -- 3 H&S officers
    true,      -- Has safety committee
    CURRENT_DATE
)
ON CONFLICT (fire_department_id, effective_from) DO NOTHING;

-- ============================================
-- STEP 5: Insert Underwriting Data (5 Years)
-- ============================================
-- Replace 1 with fire_department_id, 496 with your company_id

-- 2024-2025 (Current - Losses/LAE need to be entered via UI)
INSERT INTO underwriting (
    fire_department_id, company_id, underwriting_year,
    vfbl, wc, total_premium, losses, lae,
    number_of_claims
) VALUES (
    1, 496, '2024-2025',
    50894, 20355, 71249, 0, 0, 0
)
ON CONFLICT (fire_department_id, underwriting_year) DO UPDATE
SET vfbl = EXCLUDED.vfbl, wc = EXCLUDED.wc,
    total_premium = EXCLUDED.total_premium;

-- 2023-2024
INSERT INTO underwriting (
    fire_department_id, company_id, underwriting_year,
    vfbl, wc, total_premium, losses, lae,
    total_loss_lae, loss_ratio, number_of_claims
) VALUES (
    1, 496, '2023-2024',
    46925, 15130, 62055, 14030, 4000,
    18030, 29.06, 1
)
ON CONFLICT (fire_department_id, underwriting_year) DO UPDATE
SET vfbl = EXCLUDED.vfbl, wc = EXCLUDED.wc,
    total_premium = EXCLUDED.total_premium,
    losses = EXCLUDED.losses, lae = EXCLUDED.lae,
    total_loss_lae = EXCLUDED.total_loss_lae,
    loss_ratio = EXCLUDED.loss_ratio,
    number_of_claims = EXCLUDED.number_of_claims;

-- 2022-2023
INSERT INTO underwriting (
    fire_department_id, company_id, underwriting_year,
    vfbl, wc, total_premium, losses, lae,
    total_loss_lae, loss_ratio, number_of_claims
) VALUES (
    1, 496, '2022-2023',
    47183, 1936, 49119, 1162, 55,
    1217, 2.48, 2
)
ON CONFLICT (fire_department_id, underwriting_year) DO UPDATE
SET vfbl = EXCLUDED.vfbl, wc = EXCLUDED.wc,
    total_premium = EXCLUDED.total_premium,
    losses = EXCLUDED.losses, lae = EXCLUDED.lae,
    total_loss_lae = EXCLUDED.total_loss_lae,
    loss_ratio = EXCLUDED.loss_ratio,
    number_of_claims = EXCLUDED.number_of_claims;

-- 2021-2022
INSERT INTO underwriting (
    fire_department_id, company_id, underwriting_year,
    vfbl, wc, total_premium, losses, lae,
    total_loss_lae, loss_ratio, number_of_claims
) VALUES (
    1, 496, '2021-2022',
    45921, 2889, 48810, 6527, 3250,
    9777, 20.03, 1
)
ON CONFLICT (fire_department_id, underwriting_year) DO UPDATE
SET vfbl = EXCLUDED.vfbl, wc = EXCLUDED.wc,
    total_premium = EXCLUDED.total_premium,
    losses = EXCLUDED.losses, lae = EXCLUDED.lae,
    total_loss_lae = EXCLUDED.total_loss_lae,
    loss_ratio = EXCLUDED.loss_ratio,
    number_of_claims = EXCLUDED.number_of_claims;

-- 2020-2021
INSERT INTO underwriting (
    fire_department_id, company_id, underwriting_year,
    vfbl, wc, total_premium, losses, lae,
    total_loss_lae, loss_ratio, number_of_claims
) VALUES (
    1, 496, '2020-2021',
    46025, 3337, 49362, 1140, 44,
    1184, 2.40, 2
)
ON CONFLICT (fire_department_id, underwriting_year) DO UPDATE
SET vfbl = EXCLUDED.vfbl, wc = EXCLUDED.wc,
    total_premium = EXCLUDED.total_premium,
    losses = EXCLUDED.losses, lae = EXCLUDED.lae,
    total_loss_lae = EXCLUDED.total_loss_lae,
    loss_ratio = EXCLUDED.loss_ratio,
    number_of_claims = EXCLUDED.number_of_claims;

-- ============================================
-- STEP 6: Verify Data
-- ============================================
SELECT 
    fd.fire_department_id,
    fd.fire_department_name,
    COUNT(DISTINCT uw.underwriting_year) as years_of_data,
    COUNT(DISTINCT fdp.id) as profiles
FROM fire_departments fd
LEFT JOIN underwriting uw ON fd.fire_department_id = uw.fire_department_id
LEFT JOIN fire_department_profile fdp ON fd.fire_department_id = fdp.fire_department_id
WHERE fd.fire_department_name = 'Belgium-Cold Springs Fire District'
GROUP BY fd.fire_department_id, fd.fire_department_name;

-- ============================================
-- QUICK REFERENCE:
-- ============================================
-- After running these queries:
-- 1. Go to Applications page → Find a form for this fire department
-- 2. Click "View Form" → Go to "Underwriting Data" tab
-- 3. Enter Losses and LAE for 2024-2025
-- 4. Go to Analysis page → You should see the fire department listed
-- 5. Click "View" → See the analysis detail
-- 6. Click "Calculate Analysis" button to run the calculation

