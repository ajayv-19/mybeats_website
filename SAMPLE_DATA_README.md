# Sample Data Setup Guide

This guide helps you insert sample data to test the Analysis feature.

## Files

- **`setup_sample_data.sql`** - Step-by-step SQL with clear instructions
- **`sample_data_inserts.sql`** - Complete SQL with all details

## Quick Start

### 1. Find Your Company ID

```sql
SELECT id, "Company_Name" FROM "Subscribed_Companies";
```

Note your `id` (e.g., 496)

### 2. Run the Setup Script

Open `setup_sample_data.sql` and:
1. Replace `496` with your actual company_id (appears in multiple places)
2. Run the queries in order
3. Note the `fire_department_id` returned from Step 3
4. Replace `1` with that fire_department_id in subsequent steps

### 3. What Gets Created

✅ **Lookup Tables** - All scoring ranges for calculations  
✅ **1 Fire Department** - "Belgium-Cold Springs Fire District"  
✅ **1 Profile** - With population, calls, safety data  
✅ **5 Years Underwriting Data** - 2020-2021 through 2024-2025  

## Testing the Analysis

### Step 1: Enter Losses/LAE (via UI)
1. Go to **Applications** page
2. Find a form (or create one) for "Belgium-Cold Springs Fire District"
3. Click **View Form** → **Underwriting Data** tab
4. Enter **Losses** and **LAE** for year 2024-2025
5. Click **Save Changes**

### Step 2: View Analysis
1. Go to **Analysis** page (new menu item)
2. You should see "Belgium-Cold Springs Fire District" in the list
3. Click **View** to see details

### Step 3: Run Calculation
1. In the Analysis detail page
2. Select year "2023-2024" from dropdown
3. Click **Calculate Analysis** button
4. See the point breakdown and assigned company

## Expected Results

For the sample data (2023-2024):
- **Loss Ratio**: ~29% → **18 points**
- **Density**: 693 → **3 points**
- **Call Volume**: 938 calls → **3 points**
- **Frequency**: ~1.6 claims/100k → **4 points**
- **Safety**: Has committee → **1 point**
- **H&S Officers**: 3 → **3 points**
- **Racing Penalty**: None → **0**
- **Total**: **32 points** → Assigned to **FPI** (26-31 range)

## Troubleshooting

### "Fire department not found in Analysis list"
- Make sure you have a Form_Data record with `fire_department = 'Belgium-Cold Springs Fire District'`
- Or the fire_department has `company_id` matching your company

### "Calculation fails"
- Check that lookup tables are populated (Step 2)
- Verify all 5 years of underwriting data exist
- Ensure profile data exists

### "Can't see underwriting data"
- Verify the fire_department_id matches between tables
- Check that the form's fire_department name matches exactly

## Data Summary

| Table | Records Created |
|-------|----------------|
| lookup_loss_ratio_points | 11 ranges |
| lookup_density_points | 5 ranges |
| lookup_call_volume_points | 6 ranges |
| lookup_frequency_points | 16 ranges |
| fire_departments | 1 department |
| fire_department_profile | 1 profile |
| underwriting | 5 years (2020-2025) |

## Next Steps

After testing with this sample data:
1. Create more fire departments as needed
2. Link them to actual Form_Data records
3. Enter real Losses/LAE data via the UI
4. Run calculations for different years



