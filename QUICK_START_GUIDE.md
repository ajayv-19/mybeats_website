# Quick Start: What to Run

## TL;DR - Run This:

**Only run ONE SQL file: `setup_sample_data.sql`**

The README is just documentation - you don't "run" it.

---

## Step-by-Step Instructions

### 1. Open Your Database Tool
- Use pgAdmin, DBeaver, psql, or any PostgreSQL client
- Connect to your database

### 2. Find Your Company ID
Run this query first:
```sql
SELECT id, "Company_Name" FROM "Subscribed_Companies";
```
**Note the `id` value** (e.g., 496)

### 3. Open `setup_sample_data.sql`
This is the file you'll run. It has 6 steps:

### 4. Before Running - Make These Changes:

**In `setup_sample_data.sql`, find and replace:**
- `496` → Replace with YOUR company_id (found in step 2)
- `1` → This will be replaced AFTER you run Step 3 (see below)

### 5. Run the SQL File Section by Section:

#### ✅ STEP 1: Find Company ID (Already done above)

#### ✅ STEP 2: Insert Lookup Tables
```sql
-- Run ALL the INSERT statements for lookup tables
-- (Loss Ratio, Density, Call Volume, Frequency)
```
**Run this section** - These are required for calculations to work.

#### ✅ STEP 3: Insert Fire Department
```sql
INSERT INTO fire_departments (...) VALUES (...) RETURNING fire_department_id;
```
**Run this** - It will return a `fire_department_id` (e.g., 1, 2, 3, etc.)
**⚠️ IMPORTANT: Note this ID!**

#### ✅ STEP 4: Insert Profile
```sql
-- Replace the '1' with the fire_department_id from Step 3
INSERT INTO fire_department_profile (...)
```
**Before running:** Replace `1` with the ID from Step 3
**Then run it**

#### ✅ STEP 5: Insert Underwriting Data
```sql
-- 5 INSERT statements for 5 years
-- Replace '1' with fire_department_id in ALL 5 statements
-- Replace '496' with your company_id in ALL 5 statements
```
**Before running:** 
- Replace all `1` with your fire_department_id
- Replace all `496` with your company_id
**Then run all 5 INSERT statements**

#### ✅ STEP 6: Verify
```sql
SELECT ... -- Verification query
```
**Run this** to confirm everything was inserted correctly

---

## Alternative: Use `sample_data_inserts.sql`

If you prefer the detailed version:
1. Open `sample_data_inserts.sql`
2. Replace `496` with your company_id
3. Run Step 1 (lookup tables)
4. Run Step 2 (fire department) - note the returned ID
5. Replace `1` with that ID in remaining steps
6. Run Steps 3-6

---

## Summary

| File | Purpose | Action |
|------|---------|--------|
| `setup_sample_data.sql` | **Main file to run** | ✅ Execute this |
| `sample_data_inserts.sql` | Alternative detailed version | ⚠️ Optional - use if you prefer more details |
| `SAMPLE_DATA_README.md` | Documentation | 📖 Read only - don't run |

---

## Quick Checklist

- [ ] Found my company_id
- [ ] Opened `setup_sample_data.sql`
- [ ] Replaced `496` with my company_id
- [ ] Ran Step 2 (Lookup tables)
- [ ] Ran Step 3 (Fire department) - noted the ID
- [ ] Replaced `1` with that ID in Steps 4-5
- [ ] Ran Steps 4-5 (Profile and Underwriting)
- [ ] Ran Step 6 (Verification)
- [ ] Verified data appears in database

---

## After Running SQL

1. **Deploy backend** (if not done): `amplify push`
2. **Test in UI:**
   - Go to Applications page
   - Find/create a form for the fire department
   - Enter Losses/LAE in Underwriting Data tab
   - Go to Analysis page
   - View and calculate analysis



