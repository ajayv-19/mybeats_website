# Broker portal: form extraction (required)

**Carrier (`react-fuse_19`) no longer runs extraction.**  
`POST {carrierApiBase}/agentform/mark-submitted` only sets `Form_Data.application_status = Submitted`, `year`, and duplicate checks.

**Broker (`OnCampus/Broker`) must implement extraction** in **brokerapi** when the user finishes the last form page (attachments), for both **initial** and **renewal**.

Both apps must use the **same database** (`Form_Data`, `underwriting`, `fire_department_profile`, `fire_departments`).

---

## When to run extraction

| Event | Broker action |
| ----- | ------------- |
| Per-page Next/Save | `POST .../agentform/update` with `application_status: In_Progress` — **no extraction** |
| Last page (attachments) | **1)** Run extraction (this doc) **2)** `POST {carrierApiBase}/agentform/mark-submitted` **or** `POST brokerapi/.../mark-submitted` that does extraction + sets Submitted |

Recommended when iframe has `carrierApiBase`:

1. **brokerapi** `mark-submitted` (or dedicated `sync-form-to-underwriting`) — extraction + `form_id` on underwriting + profile + set `Form_Data.fire_department_id` / `year` if needed  
2. **carrier API** `mark-submitted` — `application_status: Submitted` + duplicate guard (no underwriting writes)

If you use a **single** brokerapi `mark-submitted` that also sets `application_status: Submitted` on shared `Form_Data`, you may skip calling carrier mark-submitted only if the carrier list and rules still see the same row state.

---

## Full extraction source (copy-paste)

**File in carrier repo (give this to broker):** `BROKER_FORM_EXTRACTION_CODE.js`  
Copy into brokerapi, e.g. `amplify/backend/function/brokerapi/src/services/form-data-sync.service.js`, and wire `require("../models")` at the top.

## Reference implementation (was on carrier; implement on broker)

Implement in e.g. `amplify/backend/function/brokerapi/src/services/form-data-sync.service.js` (or equivalent).

### Helpers

```javascript
function extractPolicyYear(effectiveDate) {
  if (!effectiveDate) return null;
  const date = new Date(effectiveDate);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  return month >= 6 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
}

function flattenFormData(formDataArray) {
  if (!Array.isArray(formDataArray)) return {};
  const flattened = {};
  formDataArray.forEach((section) => {
    if (section?.data) Object.assign(flattened, section.data);
  });
  return flattened;
}

function parseDecimal(value) {
  if (value == null || value === "") return null;
  const n = parseFloat(value);
  return Number.isNaN(n) ? null : n;
}

function parseInteger(value) {
  if (value == null || value === "") return null;
  const n = parseInt(value, 10);
  return Number.isNaN(n) ? null : n;
}

function parseBoolean(value) {
  const lower = String(value ?? "").toLowerCase();
  return lower === "on" || lower === "yes" || lower === "true" || lower === "1";
}
```

### 1) Resolve `fire_department_id`

- If `Form_Data.fire_department_id` is set → use it.  
- Else if `Form_Data.fire_department` name is set → `findOrCreate` on `fire_departments` (`fire_department_name` + `company_id`).  
- Update `Form_Data.fire_department_id` with the resolved id.

### 2) Policy year

- From `flattened.effective_date` using `extractPolicyYear`.  
- Persist `Form_Data.year` = that string (e.g. `2025-2026`).

### 3) Upsert `underwriting` (renewal year row)

**Required:** set **`form_id`** = `Form_Data.id`.

| Form field | DB column |
| ---------- | --------- |
| `vfbl_premium` | `vfbl` |
| `wc_premium` | `wc` | 
| (computed) | `total_premium` = vfbl + wc when both present |
| `Form_Data.id` | **`form_id`** |

```javascript
await Underwriting.upsert(
  {
    fire_department_id: fireDepartmentId,
    company_id: companyId,
    underwriting_year: underwritingYear,
    form_id: formId, // REQUIRED
    vfbl,
    wc,
    total_premium: totalPremium,
  },
  {
    conflictFields: ["fire_department_id", "underwriting_year"],
    updateOnDuplicate: ["company_id", "form_id", "vfbl", "wc", "total_premium"],
  }
);
```

**Do not** overwrite on extract: `losses`, `lae`, `total_loss_lae`, `loss_ratio`, `points`, `pr_factor`, `number_of_claims` (carrier enters later).

### 4) Upsert `fire_department_profile` (one row per FD + company)

| Form field | DB column |
| ---------- | --------- |
| `population` | `population` |
| `square_mileage` | `square_miles` |
| `fire_calls` | `fire_calls` |
| `ems_calls` | `ems_calls` |
| (derived) | `density`, `total_calls` |
| `racing_motorized` / `racing_motorized_count` | `motorized_racing_team`, `motorized_racing_team_count` |
| `safety_officer_count` | `hs_officers` |
| `safety_committee` | `safety_committee` |
| `broker_name` | `agent` |
| `effective_date` | `customer_since`, `valuation_date`, `renewal_date` (+1 year) |

If a profile row exists for `(fire_department_id, company_id)` → **update**. Else → **create** with `effective_from` = today.

Preserve existing `customer_since` when updating if already set.

### 5) Set `application_status`

After extraction succeeds:

- `Form_Data.application_status` = **`Submitted`**
- `Form_Data.status` = **`Pending`** (until carrier approves)

Enforce **one Submitted** per `company_id` + fire department + `year` (same rule as carrier `mark-submitted`).

---

## Carrier APIs (no extraction)

| Endpoint | Role |
| -------- | ---- |
| `POST {carrierApiBase}/agentform/mark-submitted` | Submitted + duplicate check only |
| `POST {carrierApiBase}/agentform/update` | In_Progress saves only |
| `POST {carrierApiBase}/agentform/approveOrReject` | `status` Approved/Rejected after Calculate Analysis; optional premium override |

---

## Why `form_id` on `underwriting`

Carrier **losses/LAE** UI calls `updateCarrierInput` with `form_id` and expects a row where:

`form_id` + `company_id` + `fire_department_id` match.

Without broker setting `form_id` on extract, that update returns “no row found”.

---

## Verification (broker QA)

After attachments submit:

1. `Form_Data.application_status` = `Submitted`  
2. `Form_Data.fire_department_id` and `year` set  
3. `underwriting` row for that year has `form_id` = form id, vfbl/wc/total_premium from form  
4. `fire_department_profile` updated for that FD + company  
5. Carrier agent-forms list shows the row  
6. Carrier analysis + losses/LAE work with `form_id`

---

## Carrier file (disabled)

Logic reference (commented out):  
`amplify/backend/function/user/src/services/formExtraction.service.js` — `extractFormData` and helpers are retained as reference only; **not called** from carrier `mark-submitted`.
