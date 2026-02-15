# 5-Year Calculations: How, When, and Where

## Overview

There are **two different types** of 5-year calculations in the system:

1. **5-Year Totals (UI Display)** - Sums for display in the grid
2. **5-Year Analysis Calculation** - Point scoring for a specific year

---

## 1. 5-Year Totals (UI Grid Display)

### **How:**
Calculated **on-the-fly in the frontend** using JavaScript `reduce()` functions.

**Location:** `src/app/main/apps/settings/tabs/UnderwritingGrid.tsx` (lines 448-538)

**Calculation Method:**
```typescript
// Example: Sum VFBL across 5 years
years.reduce((sum, year) => {
  const row = existingRowsMap.get(year) || editingRows[year] || {};
  return sum + (row.vfbl || 0);
}, 0)
```

**What Gets Calculated:**
- ✅ Total VFBL (sum of all 5 years)
- ✅ Total WC (sum of all 5 years)
- ✅ Total Premium (sum of VFBL + WC for all 5 years)
- ✅ Total Losses (sum of all 5 years)
- ✅ Total LAE (sum of all 5 years)
- ✅ Total Loss/LAE (sum of losses + lae for all 5 years)
- ✅ Total Loss Ratio (calculated: total_loss_lae / total_premium * 100)
- ✅ Total Points (sum of points from all 5 years)
- ✅ Total # Of Claims (sum of all 5 years)

### **When:**
- **Every time the grid renders** (when component mounts or data refreshes)
- **Real-time** as user edits values in the grid
- **No backend call** - pure frontend calculation

### **Where Stored:**
❌ **NOT stored in database** - Calculated on-the-fly for display only

**Display Location:** Bottom row of the Underwriting Grid (dark blue "5 Yr Totals" row)

---

## 2. 5-Year Analysis Calculation (Point Scoring)

### **How:**
Calculated in the **backend** using the `CalculationService`.

**Location:** 
- Backend: `amplify/backend/function/user/src/services/calculation.service.js`
- Controller: `amplify/backend/function/user/src/controllers/analysis.controller.js`

**Calculation Flow:**

1. **User triggers calculation** via UI (Analysis page → "Calculate Analysis" button)
2. **Backend receives request:** `POST /analysis/:fire_department_id/calculate`
3. **Fetches last 5 years** of underwriting data:
   ```javascript
   const underwritingRows = await Underwriting.findAll({
     where: { fire_department_id },
     order: [["underwriting_year", "DESC"]],
     limit: 5  // Gets last 5 years
   });
   ```
4. **Calculates points for TARGET YEAR** (not 5-year aggregate):
   - Uses the **specific year** selected by user (e.g., "2023-2024")
   - Calculates loss ratio from that year's data
   - Looks up points from lookup tables
   - Calculates total points
   - Determines assigned company (FDM, FDI, or FPI)

**Important:** The calculation uses **5 years of data** but calculates points for **ONE specific year** (the target year).

### **When:**
- **Manually triggered** by user clicking "Calculate Analysis" button
- **On-demand** - not automatic
- **Per year** - user selects which year to calculate

**API Endpoint:** `POST /analysis/:fire_department_id/calculate`

**Request Body:**
```json
{
  "underwriting_year": "2023-2024"
}
```

### **Where Stored:**

#### ✅ **`underwriting_results` Table**
Stores the detailed point breakdown:
- `fire_department_id`
- `underwriting_year` (the target year calculated)
- `loss_ratio_points`
- `density_points`
- `call_volume_points`
- `frequency_factor_points`
- `safety_points`
- `hso_points`
- `racing_penalty`
- `adjustments`
- `total_points`
- `assigned_company_id`
- `created_at`

**Unique Constraint:** `(fire_department_id, underwriting_year)` - One result per fire department per year

#### ✅ **`underwriting` Table (Updated)**
Updates the target year's row with:
- `points` - Total points calculated
- `company_id` - Assigned company ID

#### ✅ **`policies` Table (Created/Updated)**
Creates or updates policy record:
- `fire_department_id`
- `underwriting_year`
- `assigned_company_id`

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│ 5-YEAR TOTALS (UI Display)                              │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Frontend: UnderwritingGrid.tsx                         │
│  ├─ Reads: underwriting table (5 years)                │
│  ├─ Calculates: Sums on-the-fly                         │
│  └─ Displays: Bottom row in grid                        │
│                                                          │
│  Storage: ❌ NOT stored                                  │
│  When: Every render / real-time                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 5-YEAR ANALYSIS CALCULATION (Point Scoring)             │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  User Action: Click "Calculate Analysis"                │
│         ↓                                                │
│  Frontend: AnalysisDetail.tsx                            │
│  ├─ Sends: POST /analysis/:id/calculate                  │
│  └─ Body: { underwriting_year: "2023-2024" }           │
│         ↓                                                │
│  Backend: analysis.controller.js                         │
│  ├─ Fetches: Last 5 years from underwriting table      │
│  ├─ Fetches: Current profile                            │
│  └─ Calls: calculationService.calculate()               │
│         ↓                                                │
│  Backend: calculation.service.js                         │
│  ├─ Uses: Target year's data (from 5 years fetched)     │
│  ├─ Calculates: Loss ratio, density, calls, frequency  │
│  ├─ Looks up: Points from lookup tables                 │
│  └─ Returns: Point breakdown + assigned company         │
│         ↓                                                │
│  Backend: analysis.controller.js                         │
│  ├─ Stores: underwriting_results (detailed points)     │
│  ├─ Updates: underwriting.points & company_id          │
│  └─ Upserts: policies table                             │
│         ↓                                                │
│  Storage: ✅ underwriting_results                        │
│          ✅ underwriting (points field)                  │
│          ✅ policies                                     │
└─────────────────────────────────────────────────────────┘
```

---

## Key Differences

| Aspect | 5-Year Totals (UI) | 5-Year Analysis |
|--------|-------------------|-----------------|
| **Purpose** | Display sums in grid | Calculate points for assignment |
| **Location** | Frontend (React) | Backend (Node.js) |
| **When** | Every render | On-demand (user trigger) |
| **Stored?** | ❌ No | ✅ Yes |
| **Storage Table** | N/A | `underwriting_results` |
| **Calculation Type** | Sum/Aggregate | Point scoring + lookup |
| **Uses 5 Years?** | ✅ Yes (sums all) | ✅ Yes (fetches all, calculates for 1 year) |

---

## Example: 5-Year Totals Calculation

**Data in Database:**
```
Year        VFBL      WC      Losses   LAE
2024-2025   50,894   20,355   -        -
2023-2024   46,925   15,130   14,030   4,000
2022-2023   47,183   1,936    1,162    55
2021-2022   45,921   2,889    6,527    3,250
2020-2021   46,025   3,337    1,140    44
```

**5-Year Totals (Calculated in UI):**
```
Total VFBL:     236,308
Total WC:       27,001
Total Premium:  263,309
Total Losses:   22,859
Total LAE:      7,349
Total Loss/LAE: 30,208
Loss Ratio:     11%
Total Claims:   6
```

**Storage:** ❌ Not stored - recalculated every time grid renders

---

## Example: Analysis Calculation

**User selects:** Year "2023-2024"

**Backend fetches:** Last 5 years of data (for context, but uses 2023-2024 for calculation)

**Calculation uses 2023-2024 data:**
- Loss Ratio: 29% → **18 points** (from lookup table)
- Density: 693 → **3 points**
- Call Volume: 938 → **3 points**
- Frequency: 1.6 claims/100k → **4 points**
- Safety: Has committee → **1 point**
- H&S Officers: 3 → **3 points**
- **Total: 32 points** → Assigned to **FPI**

**Stored in `underwriting_results`:**
```sql
INSERT INTO underwriting_results (
  fire_department_id,
  underwriting_year,
  loss_ratio_points,
  density_points,
  call_volume_points,
  frequency_factor_points,
  safety_points,
  hso_points,
  total_points,
  assigned_company_id
) VALUES (
  8,
  '2023-2024',
  18,
  3,
  3,
  4,
  1,
  3,
  32,
  <FPI_company_id>
);
```

**Also updates `underwriting` table:**
```sql
UPDATE underwriting 
SET points = 32, company_id = <FPI_company_id>
WHERE fire_department_id = 8 AND underwriting_year = '2023-2024';
```

---

## Summary

1. **5-Year Totals**: Calculated in frontend, displayed in grid, NOT stored
2. **Analysis Calculation**: Calculated in backend, triggered by user, stored in `underwriting_results`, `underwriting`, and `policies` tables



