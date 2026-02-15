-- ============================================
-- INSERT UNDERWRITING DATA FOR BELGIUM-COLD SPRINGS FIRE DISTRICT
-- This version automatically finds the IDs
-- ============================================

-- Insert all 6 years of underwriting data
-- This uses a subquery to find the fire_department_id automatically

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
) 
SELECT 
    fd.fire_department_id,
    fd.company_id,  -- Uses the company_id from the fire_department record
    '2024-2025',
    50894.00,
    20355.00,
    71249.00,
    NULL,
    NULL,
    NULL,
    0.00,
    0,
    1.000
FROM fire_departments fd
WHERE fd.fire_department_name = 'Belgium-Cold Springs Fire District'
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
) 
SELECT 
    fd.fire_department_id,
    fd.company_id,
    '2023-2024',
    46925.00,
    15130.00,
    62055.00,
    14030.00,
    4000.00,
    18030.00,
    29.06,
    1
FROM fire_departments fd
WHERE fd.fire_department_name = 'Belgium-Cold Springs Fire District'
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
) 
SELECT 
    fd.fire_department_id,
    fd.company_id,
    '2022-2023',
    47183.00,
    1936.00,
    49119.00,
    1162.00,
    55.00,
    1217.00,
    2.48,
    2
FROM fire_departments fd
WHERE fd.fire_department_name = 'Belgium-Cold Springs Fire District'
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
) 
SELECT 
    fd.fire_department_id,
    fd.company_id,
    '2021-2022',
    45921.00,
    2889.00,
    48810.00,
    6527.00,
    3250.00,
    9777.00,
    20.03,
    1
FROM fire_departments fd
WHERE fd.fire_department_name = 'Belgium-Cold Springs Fire District'
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
) 
SELECT 
    fd.fire_department_id,
    fd.company_id,
    '2020-2021',
    46025.00,
    3337.00,
    49362.00,
    1140.00,
    44.00,
    1184.00,
    2.40,
    2
FROM fire_departments fd
WHERE fd.fire_department_name = 'Belgium-Cold Springs Fire District'
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
) 
SELECT 
    fd.fire_department_id,
    fd.company_id,
    '2019-2020',
    50254.00,
    3709.00,
    53963.00,
    NULL,
    NULL,
    NULL,
    0.00,
    0
FROM fire_departments fd
WHERE fd.fire_department_name = 'Belgium-Cold Springs Fire District'
ON CONFLICT (fire_department_id, underwriting_year) DO UPDATE
SET vfbl = EXCLUDED.vfbl,
    wc = EXCLUDED.wc,
    total_premium = EXCLUDED.total_premium,
    loss_ratio = EXCLUDED.loss_ratio,
    number_of_claims = EXCLUDED.number_of_claims;

-- ============================================
-- VERIFY THE DATA
-- ============================================
SELECT 
    uw.underwriting_year,
    uw.vfbl,
    uw.wc,
    uw.total_premium,
    uw.losses,
    uw.lae,
    uw.total_loss_lae,
    ROUND(uw.loss_ratio, 2) as loss_ratio,
    uw.number_of_claims,
    uw.pr_factor,
    c."Company_Name" as company_name
FROM underwriting uw
LEFT JOIN "Subscribed_Companies" c ON uw.company_id = c.id
WHERE uw.fire_department_id = (
    SELECT fire_department_id 
    FROM fire_departments 
    WHERE fire_department_name = 'Belgium-Cold Springs Fire District'
)
ORDER BY uw.underwriting_year DESC;

-- ============================================
-- CHECK 5-YEAR TOTALS
-- ============================================
SELECT 
    '5 Yr Totals' as label,
    SUM(uw.vfbl) as total_vfbl,
    SUM(uw.wc) as total_wc,
    SUM(uw.total_premium) as total_premium,
    SUM(uw.losses) as total_losses,
    SUM(uw.lae) as total_lae,
    SUM(uw.total_loss_lae) as total_loss_lae,
    ROUND(
        CASE 
            WHEN SUM(uw.total_premium) > 0 
            THEN (SUM(uw.total_loss_lae) / SUM(uw.total_premium)) * 100 
            ELSE 0 
        END, 
        2
    ) as total_loss_ratio,
    SUM(uw.number_of_claims) as total_claims
FROM underwriting uw
WHERE uw.fire_department_id = (
    SELECT fire_department_id 
    FROM fire_departments 
    WHERE fire_department_name = 'Belgium-Cold Springs Fire District'
)
AND uw.underwriting_year IN ('2024-2025', '2023-2024', '2022-2023', '2021-2022', '2020-2021');



