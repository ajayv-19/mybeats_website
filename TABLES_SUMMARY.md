# Database Tables Used for Underwriting Data

## Tables We INSERT Data Into:

### 1. **`underwriting`** (Primary Table)
**Purpose**: Stores the 5-year underwriting history for each fire department

**Columns We Insert:**
- `fire_department_id` - Links to fire_departments table
- `company_id` - Links to Subscribed_Companies table (the insurance company)
- `underwriting_year` - Year in format "YYYY-YYYY" (e.g., "2024-2025")
- `vfbl` - Volunteer Fire Benefit League premium
- `wc` - Workers Compensation premium
- `total_premium` - Calculated: vfbl + wc
- `losses` - Total losses for the year
- `lae` - Loss Adjustment Expense
- `total_loss_lae` - Calculated: losses + lae
- `loss_ratio` - Calculated: (total_loss_lae / total_premium) * 100
- `number_of_claims` - Number of claims for the year
- `pr_factor` - Premium Ratio factor (P/R column in Excel)

**Unique Constraint**: `(fire_department_id, underwriting_year)` - One record per fire department per year

---

## Tables We REFERENCE (But Don't Insert Into):

### 2. **`fire_departments`**
**Purpose**: Master table of all fire departments

**Used For**: 
- Getting `fire_department_id` via subquery
- Getting `company_id` from the fire department record

**Key Columns**:
- `fire_department_id` (Primary Key)
- `company_id` (Foreign Key to Subscribed_Companies)
- `fire_department_name` (Used in WHERE clause: "Belgium-Cold Springs Fire District")

**Note**: This table should already exist. If not, you need to insert the fire department first.

---

### 3. **`Subscribed_Companies`**
**Purpose**: Master table of insurance companies

**Used For**:
- Getting company information for display (JOIN in verification query)
- The `company_id` is stored in `underwriting` table

**Key Columns**:
- `id` (Primary Key)
- `Company_Name` (e.g., "FPI")

**Note**: This table should already exist. The company should be created before inserting underwriting data.

---

## Optional Tables (For Complete Setup):

### 4. **`fire_department_profile`**
**Purpose**: Stores demographic and operational data for fire departments

**Used For**: Analysis calculations (density, call volume, safety points, etc.)

**Key Columns**:
- `fire_department_id` (Foreign Key)
- `population` - Used for density calculation
- `square_miles` - Used for density calculation
- `fire_calls` - Used for call volume points
- `ems_calls` - Used for call volume points
- `motorized_racing_team` - Used for penalty points
- `hs_officers` - Used for H&S points (max 3)
- `safety_committee` - Used for safety points
- `effective_from` - Date when profile becomes effective

**Note**: Not required for the underwriting grid display, but needed for Analysis feature.

---

### 5. **`underwriting_results`**
**Purpose**: Stores calculated analysis results (points breakdown, assigned company)

**Used For**: Storing results from the Analysis calculation feature

**Key Columns**:
- `fire_department_id`
- `underwriting_year`
- `loss_ratio_points`
- `density_points`
- `call_volume_points`
- `frequency_factor_points`
- `safety_points`
- `hso_points`
- `racing_penalty`
- `total_points`
- `assigned_company_id`

**Note**: This table is populated automatically when you run "Calculate Analysis" from the UI, not via SQL inserts.

---

## Summary

### For the Underwriting Grid Display:
**Only 1 table needs data inserted:**
- ✅ **`underwriting`** - Insert 6 years of data (2019-2020 through 2024-2025)

### Prerequisites (Should Already Exist):
- ✅ **`fire_departments`** - Fire department record must exist
- ✅ **`Subscribed_Companies`** - Company record must exist

### For Full Functionality:
- ✅ **`fire_department_profile`** - Needed for Analysis feature calculations

---

## Data Flow:

```
fire_departments (exists)
    ↓ (provides fire_department_id and company_id)
underwriting (INSERT data here)
    ↓ (displays in UI grid)
UnderwritingGrid.tsx (shows the data)
```

## SQL File Breakdown:

The `insert_underwriting_data_auto.sql` file:
1. **Reads from**: `fire_departments` (to get IDs)
2. **Inserts into**: `underwriting` (6 INSERT statements for 6 years)
3. **Reads from**: `Subscribed_Companies` (for verification query only)



