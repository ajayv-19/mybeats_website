-- ============================================
-- INSERT UNDERWRITING DATA FOR BELGIUM-COLD SPRINGS FIRE DISTRICT
-- Based on Excel data shown in the UI
-- ============================================

-- STEP 1: Find the Company ID for "FPI"
-- Run this first to get the company_id
SELECT id, "Company_Name" FROM "Subscribed_Companies" 
WHERE "Company_Name" ILIKE '%FPI%' OR "Company_Name" ILIKE '%Fire%';
-- Note the id value (e.g., if FPI doesn't exist, you may need to use company_id = 496 or create it)

-- STEP 2: Find the Fire Department ID
-- Run this to get the fire_department_id
SELECT fire_department_id, fire_department_name, company_id 
FROM fire_departments 
WHERE fire_department_name = 'Belgium-Cold Springs Fire District';
-- Note the fire_department_id (likely 8 based on earlier context)

-- ============================================
-- STEP 3: INSERT UNDERWRITING DATA
-- Replace @FIRE_DEPARTMENT_ID@ with the ID from Step 2
-- Replace @COMPANY_ID@ with the ID from Step 1 (or use 496 if FPI doesn't exist)
-- ============================================

-- Year 2024-2025
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
    number_of_claims,
    pr_factor
) VALUES (
    8,  -- ⚠️ REPLACE with fire_department_id from Step 2
    496,  -- ⚠️ REPLACE with company_id for FPI from Step 1
    '2024-2025',
    50894.00,  -- VFBL
    20355.00,  -- WC
    71249.00,  -- Total Premium (calculated: VFBL + WC)
    NULL,      -- Losses (empty in Excel, carrier to enter)
    NULL,      -- LAE (empty in Excel, carrier to enter)
    NULL,      -- Total Loss/LAE (calculated when losses/lae entered)
    0.00,      -- Loss Ratio (0% when no losses)
    0,         -- # Of Claims
    1.000      -- P/R
)
ON CONFLICT (fire_department_id, underwriting_year) DO UPDATE
SET vfbl = EXCLUDED.vfbl,
    wc = EXCLUDED.wc,
    total_premium = EXCLUDED.total_premium,
    loss_ratio = EXCLUDED.loss_ratio,
    number_of_claims = EXCLUDED.number_of_claims,
    pr_factor = EXCLUDED.pr_factor;

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
    number_of_claims
) VALUES (
    8,  -- ⚠️ REPLACE with fire_department_id from Step 2
    496,  -- ⚠️ REPLACE with company_id for FPI from Step 1
    '2023-2024',
    46925.00,  -- VFBL
    15130.00,  -- WC
    62055.00,  -- Total Premium (calculated: VFBL + WC)
    14030.00,  -- Losses
    4000.00,   -- LAE
    18030.00,  -- Total Loss/LAE (calculated: Losses + LAE)
    29.06,     -- Loss Ratio (calculated: 18030/62055 * 100 = 29%)
    1          -- # Of Claims
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
    number_of_claims
) VALUES (
    8,  -- ⚠️ REPLACE with fire_department_id from Step 2
    496,  -- ⚠️ REPLACE with company_id for FPI from Step 1
    '2022-2023',
    47183.00,  -- VFBL
    1936.00,   -- WC
    49119.00,  -- Total Premium (calculated: VFBL + WC)
    1162.00,   -- Losses
    55.00,     -- LAE
    1217.00,   -- Total Loss/LAE (calculated: Losses + LAE)
    2.48,      -- Loss Ratio (calculated: 1217/49119 * 100 = 2.48%)
    2          -- # Of Claims
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
    number_of_claims
) VALUES (
    8,  -- ⚠️ REPLACE with fire_department_id from Step 2
    496,  -- ⚠️ REPLACE with company_id for FPI from Step 1
    '2021-2022',
    45921.00,  -- VFBL
    2889.00,   -- WC
    48810.00,  -- Total Premium (calculated: VFBL + WC)
    6527.00,   -- Losses
    3250.00,   -- LAE
    9777.00,   -- Total Loss/LAE (calculated: Losses + LAE)
    20.03,     -- Loss Ratio (calculated: 9777/48810 * 100 = 20.03%)
    1          -- # Of Claims
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
    number_of_claims
) VALUES (
    8,  -- ⚠️ REPLACE with fire_department_id from Step 2
    496,  -- ⚠️ REPLACE with company_id for FPI from Step 1
    '2020-2021',
    46025.00,  -- VFBL
    3337.00,   -- WC
    49362.00,  -- Total Premium (calculated: VFBL + WC)
    1140.00,   -- Losses
    44.00,     -- LAE
    1184.00,   -- Total Loss/LAE (calculated: Losses + LAE)
    2.40,      -- Loss Ratio (calculated: 1184/49362 * 100 = 2.40%)
    2          -- # Of Claims
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

-- Year 2019-2020
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
    number_of_claims
) VALUES (
    8,  -- ⚠️ REPLACE with fire_department_id from Step 2
    496,  -- ⚠️ REPLACE with company_id for FPI from Step 1
    '2019-2020',
    50254.00,  -- VFBL
    3709.00,   -- WC
    53963.00,  -- Total Premium (calculated: VFBL + WC)
    NULL,      -- Losses (empty in Excel)
    NULL,      -- LAE (empty in Excel)
    NULL,      -- Total Loss/LAE (calculated when losses/lae entered)
    0.00,      -- Loss Ratio (0% when no losses)
    0          -- # Of Claims
)
ON CONFLICT (fire_department_id, underwriting_year) DO UPDATE
SET vfbl = EXCLUDED.vfbl,
    wc = EXCLUDED.wc,
    total_premium = EXCLUDED.total_premium,
    loss_ratio = EXCLUDED.loss_ratio,
    number_of_claims = EXCLUDED.number_of_claims;

-- ============================================
-- STEP 4: VERIFY THE DATA
-- ============================================
SELECT 
    uw.underwriting_year,
    uw.vfbl,
    uw.wc,
    uw.total_premium,
    uw.losses,
    uw.lae,
    uw.total_loss_lae,
    uw.loss_ratio,
    uw.number_of_claims,
    uw.pr_factor,
    c."Company_Name" as company_name
FROM underwriting uw
LEFT JOIN "Subscribed_Companies" c ON uw.company_id = c.id
WHERE uw.fire_department_id = 8  -- ⚠️ REPLACE with your fire_department_id
ORDER BY uw.underwriting_year DESC;

-- ============================================
-- EXPECTED RESULTS (5 Yr Totals):
-- ============================================
-- VFBL: $236,308
-- WC: $27,001
-- Total Premium: $263,309
-- Losses: $22,859
-- LAE: $7,349
-- Total Loss/LAE: $30,208
-- Loss Ratio: 11%
-- # Of Claims: 6
-- ============================================



