-- ============================================
-- SAMPLE DATA INSERT QUERIES
-- Use these to populate tables for testing analysis
-- ============================================

-- ============================================
-- 1. INSERT LOOKUP TABLES (Required for calculations)
-- ============================================

-- Loss Ratio Points
INSERT INTO lookup_loss_ratio_points (min_value, max_value, points) VALUES
(0.00, 10.00, 22),
(11.00, 20.00, 20),
(21.00, 30.00, 18),
(31.00, 40.00, 16),
(41.00, 50.00, 14),
(51.00, 60.00, 12),
(61.00, 70.00, 10),
(71.00, 80.00, 8),
(81.00, 90.00, 6),
(91.00, 100.00, 4),
(101.00, 1000.00, 0)
ON CONFLICT DO NOTHING;

-- Density Points
INSERT INTO lookup_density_points (min_value, max_value, points) VALUES
(0, 500, 4),
(501, 1500, 3),
(1501, 3000, 2),
(3001, 5000, 1),
(5001, 15000, 0)
ON CONFLICT DO NOTHING;

-- Call Volume Points
INSERT INTO lookup_call_volume_points (min_value, max_value, points) VALUES
(0, 250, 5),
(251, 500, 4),
(501, 1000, 3),
(1001, 1500, 2),
(1501, 2000, 1),
(2001, 10000, 0)
ON CONFLICT DO NOTHING;

-- Frequency Points (Claims per 100k)
INSERT INTO lookup_frequency_points (min_value, max_value, points) VALUES
(0.00, 0.75, 5),
(0.76, 1.50, 4),
(1.51, 2.25, 3),
(2.26, 3.00, 2),
(3.01, 3.75, 1),
(3.76, 4.50, 0),
(4.51, 5.25, -1),
(5.26, 6.00, -2),
(6.01, 6.75, -3),
(6.76, 7.50, -4),
(7.51, 8.25, -5),
(8.26, 9.00, -6),
(9.01, 9.75, -7),
(9.76, 10.50, -8),
(10.51, 11.25, -9),
(11.26, 9999.99, -10)
ON CONFLICT DO NOTHING;

-- ============================================
-- 2. INSERT FIRE DEPARTMENT
-- ============================================

-- First, get your company_id from Subscribed_Companies table
-- Replace 496 with your actual company_id
INSERT INTO fire_departments (
    company_id,
    fire_department_name,
    county,
    state,
    website,
    customer_since,
    renewal_date,
    valuation_date,
    agent
) VALUES (
    496,  -- Replace with your company_id
    'Belgium-Cold Springs Fire District',
    'Onondaga',
    'NY',
    'https://example.com',
    '2000-01-01',
    '2025-12-31',
    '2025-09-29',
    'McNeil & Company, Inc.'
)
ON CONFLICT DO NOTHING
RETURNING fire_department_id;

-- Note the fire_department_id returned (let's assume it's 1 for the rest of the queries)
-- Replace 1 with the actual fire_department_id returned above

-- ============================================
-- 3. INSERT FIRE DEPARTMENT PROFILE
-- ============================================

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
) VALUES (
    1,  -- Replace with actual fire_department_id
    9500,
    13.7,
    269,
    669,
    false,  -- No racing team
    3,      -- 3 H&S officers
    true,   -- Has safety committee
    CURRENT_DATE,
    NULL,   -- Current profile
    'system@example.com'
)
ON CONFLICT (fire_department_id, effective_from) DO NOTHING;

-- ============================================
-- 4. INSERT UNDERWRITING DATA (Last 5 Years)
-- ============================================

-- Year 2024-2025 (Current Year)
INSERT INTO underwriting (
    fire_department_id,
    company_id,
    underwriting_year,
    vfbl,
    wc,
    total_premium,
    losses,
    lae,
    total_loss_lae,
    loss_ratio,
    points,
    number_of_claims,
    pr_factor
) VALUES (
    1,  -- Replace with actual fire_department_id
    496,  -- Replace with your company_id
    '2024-2025',
    50894.00,
    20355.00,
    71249.00,
    0.00,      -- Carrier to enter
    0.00,      -- Carrier to enter
    0.00,
    0.00,
    NULL,      -- Will be calculated
    0,         -- No claims yet
    1.0
)
ON CONFLICT (fire_department_id, underwriting_year) DO UPDATE
SET vfbl = EXCLUDED.vfbl,
    wc = EXCLUDED.wc,
    total_premium = EXCLUDED.total_premium,
    number_of_claims = EXCLUDED.number_of_claims;

-- Year 2023-2024
INSERT INTO underwriting (
    fire_department_id,
    company_id,
    underwriting_year,
    vfbl,
    wc,
    total_premium,
    losses,
    lae,
    total_loss_lae,
    loss_ratio,
    points,
    number_of_claims,
    pr_factor
) VALUES (
    1,
    496,
    '2023-2024',
    46925.00,
    15130.00,
    62055.00,
    14030.00,
    4000.00,
    18030.00,
    29.06,
    3,
    1,
    0.0
)
ON CONFLICT (fire_department_id, underwriting_year) DO UPDATE
SET vfbl = EXCLUDED.vfbl,
    wc = EXCLUDED.wc,
    total_premium = EXCLUDED.total_premium,
    losses = EXCLUDED.losses,
    lae = EXCLUDED.lae,
    total_loss_lae = EXCLUDED.total_loss_lae,
    loss_ratio = EXCLUDED.loss_ratio,
    number_of_claims = EXCLUDED.number_of_claims;

-- Year 2022-2023
INSERT INTO underwriting (
    fire_department_id,
    company_id,
    underwriting_year,
    vfbl,
    wc,
    total_premium,
    losses,
    lae,
    total_loss_lae,
    loss_ratio,
    points,
    number_of_claims,
    pr_factor
) VALUES (
    1,
    496,
    '2022-2023',
    47183.00,
    1936.00,
    49119.00,
    1162.00,
    55.00,
    1217.00,
    2.48,
    2,
    2,
    0.0
)
ON CONFLICT (fire_department_id, underwriting_year) DO UPDATE
SET vfbl = EXCLUDED.vfbl,
    wc = EXCLUDED.wc,
    total_premium = EXCLUDED.total_premium,
    losses = EXCLUDED.losses,
    lae = EXCLUDED.lae,
    total_loss_lae = EXCLUDED.total_loss_lae,
    loss_ratio = EXCLUDED.loss_ratio,
    number_of_claims = EXCLUDED.number_of_claims;

-- Year 2021-2022
INSERT INTO underwriting (
    fire_department_id,
    company_id,
    underwriting_year,
    vfbl,
    wc,
    total_premium,
    losses,
    lae,
    total_loss_lae,
    loss_ratio,
    points,
    number_of_claims,
    pr_factor
) VALUES (
    1,
    496,
    '2021-2022',
    45921.00,
    2889.00,
    48810.00,
    6527.00,
    3250.00,
    9777.00,
    20.03,
    2,
    1,
    0.0
)
ON CONFLICT (fire_department_id, underwriting_year) DO UPDATE
SET vfbl = EXCLUDED.vfbl,
    wc = EXCLUDED.wc,
    total_premium = EXCLUDED.total_premium,
    losses = EXCLUDED.losses,
    lae = EXCLUDED.lae,
    total_loss_lae = EXCLUDED.total_loss_lae,
    loss_ratio = EXCLUDED.loss_ratio,
    number_of_claims = EXCLUDED.number_of_claims;

-- Year 2020-2021
INSERT INTO underwriting (
    fire_department_id,
    company_id,
    underwriting_year,
    vfbl,
    wc,
    total_premium,
    losses,
    lae,
    total_loss_lae,
    loss_ratio,
    points,
    number_of_claims,
    pr_factor
) VALUES (
    1,
    496,
    '2020-2021',
    46025.00,
    3337.00,
    49362.00,
    1140.00,
    44.00,
    1184.00,
    2.40,
    2,
    2,
    0.0
)
ON CONFLICT (fire_department_id, underwriting_year) DO UPDATE
SET vfbl = EXCLUDED.vfbl,
    wc = EXCLUDED.wc,
    total_premium = EXCLUDED.total_premium,
    losses = EXCLUDED.losses,
    lae = EXCLUDED.lae,
    total_loss_lae = EXCLUDED.total_loss_lae,
    loss_ratio = EXCLUDED.loss_ratio,
    number_of_claims = EXCLUDED.number_of_claims;

-- ============================================
-- 5. OPTIONAL: INSERT SAMPLE ANALYSIS RESULT
-- ============================================

-- This would be created by running the calculation, but here's a sample:
INSERT INTO underwriting_results (
    fire_department_id,
    underwriting_year,
    loss_ratio_points,
    density_points,
    call_volume_points,
    frequency_factor_points,
    safety_points,
    hso_points,
    racing_penalty,
    adjustments,
    total_points,
    assigned_company_id
) VALUES (
    1,
    '2023-2024',
    18,  -- Loss ratio ~29% = 18 points
    3,   -- Density ~693 = 3 points
    3,   -- Total calls 938 = 3 points
    4,   -- Claims per 100k ~1.6 = 4 points
    1,   -- Safety committee = 1 point
    3,   -- 3 H&S officers = 3 points
    0,   -- No racing team = 0 penalty
    0,   -- No adjustments
    32,  -- Total: 18+3+3+4+1+3+0+0 = 32 points
    496  -- FPI (26-31 points range)
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

-- ============================================
-- 6. OPTIONAL: INSERT SAMPLE POLICY
-- ============================================

INSERT INTO policies (
    fire_department_id,
    underwriting_year,
    assigned_company_id,
    policy_value,
    policy_number,
    effective_date,
    expiry_date
) VALUES (
    1,
    '2024-2025',
    496,
    71249.00,
    'POL-2024-001',
    '2024-12-31',
    '2025-12-31'
)
ON CONFLICT (fire_department_id, underwriting_year) DO UPDATE
SET assigned_company_id = EXCLUDED.assigned_company_id,
    policy_value = EXCLUDED.policy_value,
    policy_number = EXCLUDED.policy_number,
    effective_date = EXCLUDED.effective_date,
    expiry_date = EXCLUDED.expiry_date;

-- ============================================
-- 7. VERIFICATION QUERIES
-- ============================================

-- Check fire department was created
SELECT * FROM fire_departments WHERE fire_department_name = 'Belgium-Cold Springs Fire District';

-- Check profile was created
SELECT * FROM fire_department_profile WHERE fire_department_id = 1;

-- Check underwriting data
SELECT * FROM underwriting WHERE fire_department_id = 1 ORDER BY underwriting_year DESC;

-- Check lookup tables
SELECT COUNT(*) as loss_ratio_ranges FROM lookup_loss_ratio_points;
SELECT COUNT(*) as density_ranges FROM lookup_density_points;
SELECT COUNT(*) as call_volume_ranges FROM lookup_call_volume_points;
SELECT COUNT(*) as frequency_ranges FROM lookup_frequency_points;

-- ============================================
-- NOTES:
-- ============================================
-- 1. Replace '496' with your actual company_id from Subscribed_Companies
-- 2. Replace '1' with the actual fire_department_id returned from the first INSERT
-- 3. The current year (2024-2025) has losses=0 and lae=0 - you can enter these via the UI
-- 4. After inserting, you can test the analysis calculation endpoint
-- 5. Make sure your Form_Data table has a record linking to this fire department name
--    if you want to see it in the Applications list



