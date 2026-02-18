# Test Form Submission Example

## Test Data File
The test data is stored in `test_form_data.json` in the project root.

## How to Use for Testing

### 1. Submit Form via API

**Endpoint:** `POST /backendapi/agentform/submit`

**Request Body:**
```json
{
  "company_id": 496,
  "data": [/* content from test_form_data.json */],
  "insurance_company": "Test Insurance Company",
  "fire_department": "Athens-Clarke County Fire Service, GA",
  "status": "Pending",
  "updated_by": "test@example.com"
}
```

### 2. Example cURL Command

```bash
curl -X POST https://your-api-url/backendapi/agentform/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "company_id": 496,
    "data": [/* paste content from test_form_data.json */],
    "insurance_company": "Test Insurance Company",
    "fire_department": "Athens-Clarke County Fire Service, GA",
    "status": "Pending",
    "updated_by": "test@example.com"
  }'
```

### 3. Test Data Summary

**Form Type:** Initial Application

**Key Test Fields:**
- **Page 1:** Coverage (VFBL & WC), Fire Department Info, Contact Details, Broker Info, Policy Numbers
- **Page 2:** Population, Coverage Area, Mutual Aid, Calls Data, Safety Information, Racing Teams
- **Page 3:** Vehicles, Personnel Counts, Employment Data, Signatures

**Fire Department:** Athens-Clarke County Fire Service, GA (ID: 10)
**Effective Date:** 2026-02-06
**Policy Year:** 2025-2026 (based on effective date)

### 4. Testing Approval Flow

1. Submit form with status "Pending"
2. Approve form (status changes to "Approved")
3. Verify data is stored in:
   - `underwriting` table (VFBL, WC, total_premium)
   - `fire_department_profile` table (profile data)
4. Verify form cannot be rejected after approval

### 5. Testing Losses/LAE Entry

After approval:
1. Click warning icon or "Enter Losses/LAE" button
2. Enter losses and LAE values
3. Verify calculations:
   - Total Loss/LAE = losses + lae
   - Loss Ratio = (Total Loss/LAE / Total Premium) * 100
