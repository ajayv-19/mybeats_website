# Broker Form Integration: What to Implement

## Overview

The carrier portal embeds broker forms in an iframe: `form.html` for initial applications, `renewal.html` for renewals. Both receive the same URL parameters and must behave the same when viewed from the carrier.

---

## URL Parameters the Carrier Sends

| Parameter        | Purpose                                                   |
| ---------------- | --------------------------------------------------------- |
| `company_id`     | Company ID (e.g. 496)                                     |
| `editFormId`     | Form ID to load (e.g. 501)                                |
| `isReadOnly`     | `"true"` = form is read-only                              |
| `isHideButtons`  | `"true"` = only Previous and Next should work (see below) |
| `carrierApiBase` | URL-encoded API base URL for fetching form data           |
| `parentOrigin`   | Carrier app origin (e.g. `http://localhost:3000`) — required for **View Analytics** unlock (see below) |

Example path: `agent_forms/{companyId}/form.html` or `agent_forms/{companyId}/renewal.html` with the above query params.

---

## Things to Implement (Both form.html and renewal.html)

### 1. Read URL parameters

- Read `editFormId`, `isReadOnly`, `isHideButtons`, and `carrierApiBase` from the page URL.

### 2. Buttons when `isHideButtons=true`

- **Keep visible and working:** Previous and Next only (so the user can move between form pages).
- **Hide or disable:** Submit, Print, and any other action buttons.

### 3. Read-only when `isReadOnly=true`

- Disable or make read-only all form fields (inputs, textareas, selects) so the user cannot edit.

### 4. Load form data when `editFormId` is present

- Call `GET {carrierApiBase}/agentform/{editFormId}` to fetch the form (decode `carrierApiBase` first).
- Response has `data.data`: an array of pages, each with `formNumber` (e.g. `"1"`, `"2"`) and `data` (object of field names → values).
- Populate each form page by matching `formNumber` to your page/section (e.g. `[data-form="1"]`, `[data-form="2"]`).

### 6. Fetch fire departments list (for dropdowns)

- If you need to populate a fire departments dropdown, call `GET {carrierApiBase}/fire-departments` **with at least one query parameter** (do not call the bare URL).
- Preferred (from iframe URL): `?editFormId={editFormId}` and/or `?company_id={company_id}`.
- If the form is already linked to a fire department (carrier view / read-only), pass the id from `Form_Data` after loading the form: `?fire_department_id={fire_department_id}`. The API resolves `company_id` from the latest `Form_Data` row or from `fire_departments`, then returns the full list for that company. If only the department id is known, it still returns at least that one row.
- Direct: `?company_id={company_id}`.
- Response `data`: array of `{ fire_department_id, fire_department_name, county, state, company_id }`.

### 5. postMessage as backup data source

- Listen for `message` events where `event.data.type === 'CARRIER_FORM_DATA'`.
- Use `event.data.data` (same shape as API: e.g. `data` array of `{ formNumber, data }`) to populate the form.
- Carrier sends this on iframe load and retries at 100ms and 500ms, so a late-attached listener can still receive it.

### 7. Notify carrier when the user changes pages (**View Analytics** — required)

The carrier app shows a **View Analytics** button only after the user has reached the **last page** of the form (e.g. page 4 / attachments). Once unlocked, the button **stays visible** even if the user goes back to earlier pages.

**You must post a message to the parent window on every page change** (initial load, Next, Previous, and after submit advances the page).

1. Read `parentOrigin` from the query string (the carrier adds `parentOrigin=...` to the iframe URL).
2. After showing a page, call:

```javascript
function notifyParentFormPage(pageIndex, totalPages) {
  const params = new URLSearchParams(window.location.search);
  const parentOrigin = params.get("parentOrigin");
  const target = parentOrigin || "*";

  if (window.parent === window) return;

  window.parent.postMessage(
    {
      type: "BROKER_FORM_PAGE",
      pageIndex: pageIndex,           // 0-based index of the visible page
      totalPageSections: totalPages,  // total number of pages/sections
      isLastPage: totalPages > 0 && pageIndex === totalPages - 1,
    },
    target
  );
}
```

3. Call `notifyParentFormPage` from your existing `showPage(idx)` (or equivalent) **after** the new page is visible.
4. Call it on **first paint** for whichever page is shown on load.

**Last page rule:** `isLastPage` must be `true` only when the user is on the **final** section (e.g. `data-page="4"` or the attachments / thank-you step). For a 4-page form, that is `pageIndex === 3` when `totalPageSections === 4`.

**Reference:** `public/company1/form.html` in the carrier repo includes `notifyBrokerFormPage` — copy the same pattern into your deployed `form.html` and `renewal.html`.

If you do not send `BROKER_FORM_PAGE` with `isLastPage: true`, the carrier will **never** show View Analytics.

---

## What renewal.html Is Missing Today

- **form.html** already: reads params, hides the right buttons, disables fields when read-only, calls the API when `editFormId` is set, and can use postMessage.
- **renewal.html** must implement the same behavior, especially:
  - Call the API when `editFormId` and `carrierApiBase` are present.
  - Populate the form from the API response (and optionally from postMessage).

---

## API Response Shape (for reference)

- `GET {carrierApiBase}/agentform/{editFormId}` returns JSON.
- Use `result.data.data`: array of `{ formNumber: "1"|"2"|..., data: { fieldName: value, ... } }`.
- Map each item to the matching page and fill fields by name.

---

## 8. Application lifecycle: `In_Progress` → `Submitted` → carrier `Approved` / `Rejected`

This section is **required** for the **broker portal** (separate app/repo).

**Extraction** (`underwriting`, `fire_department_profile`, **`underwriting.form_id`**) is implemented on the **broker** side — see **`BROKER_FORM_EXTRACTION.md`**.

The **carrier** `POST .../agentform/mark-submitted` only sets `application_status: Submitted` and duplicate checks; it does **not** write underwriting/profile.

### How the broker portal calls the carrier API

The broker app already has the carrier API base URL (same as today for `GET /agentform/{id}`):

- Query param on the form URL: `carrierApiBase` (URL-encoded), e.g.  
  `https://b89ns5qxe2.execute-api.us-east-1.amazonaws.com/dev/backendapi`
- Decode it once: `const apiBase = decodeURIComponent(params.get('carrierApiBase'))`

**Initial (`form.html`) and renewal (`renewal.html`) use the same endpoints and the same lifecycle.** Only the HTML/fields differ; `type` on the row may be `initial` vs `renewal` — extraction does not branch on that.

Example when the user finishes the **last page** (broker JavaScript):

```javascript
async function markApplicationSubmitted(formId, allPagesData, updatedBy) {
  const params = new URLSearchParams(window.location.search);
  const apiBase = decodeURIComponent(params.get("carrierApiBase") || "");

  const res = await fetch(`${apiBase}/agentform/mark-submitted`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: formId,
      data: allPagesData, // [{ formNumber, data }, ...] all pages
      updated_by: updatedBy,
    }),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "mark-submitted failed");
  return json;
}
```

Per-page save (not final):

```javascript
await fetch(`${apiBase}/agentform/update`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    id: formId,
    data: allPagesDataSoFar,
    application_status: "In_Progress",
    updated_by: updatedBy,
  }),
});
```

No auth header is required for these routes today (same as existing `submit` / `update` bypass list on the carrier API).

### What changed vs the old flow

| Before | Now |
| ------ | --- |
| Carrier extracted on approve | Broker **brokerapi** extracts on mark-submitted; carrier API mark-submitted = Submitted flag only |
| Approve on agent-forms list | **Approve / Reject** on **Analysis** page after **Calculate Analysis** (5-yr history + profile checks) |
| Same for initial and renewal | Same — one `mark-submitted` + one extraction path |

Carrier side after Submitted: underwriter opens form → **View Analytics** → validates/fills missing **loss history** and **profile** if needed → **Calculate Analysis** → **Approve** or **Reject** (optional premium override on approve only).

The carrier no longer copies form data into `underwriting` / `fire_department_profile` on approve.

### Two status fields on `Form_Data`

| Field | Who sets it | Values | Meaning |
| ----- | ----------- | ------ | ------- |
| `application_status` | **Broker** | `In_Progress`, `Submitted` | Broker workflow only — **stays `Submitted`** after carrier approves |
| `status` | **Carrier** (analysis page) | `Pending`, `Approved`, `Rejected` | Underwriting decision after analytics |

**Important:** `POST /agentform/approveOrReject` uses a body field named `application_status` with values `"Approved"` / `"Rejected"`, but the API writes the **`status`** column on `Form_Data`, not `application_status`.  
**Calculate Analysis** does not change either field; it only creates/updates **`underwriting_results`**. Approve/Reject buttons on the analysis page run only after Calculate Analysis succeeds.

Carrier agent-forms list shows rows where `application_status = Submitted` only.

### Per-page save (in progress) — **no extraction**

When the user saves a **single page** (not finished with the whole application):

```http
POST {carrierApiBase}/agentform/update
Content-Type: application/json

{
  "id": 628,
  "data": [ { "formNumber": "1", "data": { ... } }, ... ],
  "application_status": "In_Progress",
  "insurance_company": "...",
  "fire_department": "...",
  "updated_by": "broker@example.com"
}
```

- Set `application_status` to **`In_Progress`** (or omit if already in progress).
- **Do not** call `mark-submitted` here.
- **Do not** expect `underwriting` or `fire_department_profile` to update on this call.

If `status` on the row is already **`Approved`**, the API returns **400** — the form cannot be edited.

### Final submit (all pages complete) — **extraction happens here**

When the user completes the **last page** and the application is ready for the carrier:

1. Ensure `data` contains **all pages** (same array shape as today).
2. Ensure `effective_date` is set (used for policy year `YYYY-YYYY`).
3. Ensure `fire_department` (name) and/or `fire_department_id` is set on the form.
4. Call:

```http
POST {carrierApiBase}/agentform/mark-submitted
Content-Type: application/json

{
  "id": 628,
  "data": [ ... optional final merge of all pages ... ],
  "updated_by": "broker@example.com"
}
```

**Carrier API behavior** (`POST {carrierApiBase}/agentform/mark-submitted`):

- Sets `application_status` = **`Submitted`**
- Sets `year` from `effective_date` if not already set
- **Duplicate guard** (one Submitted per company + FD + policy year)
- **Does not** extract — broker must run extraction per **`BROKER_FORM_EXTRACTION.md`** (same DB)

**Do not** use `POST /agentform/update` with `application_status: "Submitted"` — use `mark-submitted` only.

### Initial create

```http
POST {carrierApiBase}/agentform/submit
```

Carrier sets `application_status: "In_Progress"` on create. Broker should keep it in progress until `mark-submitted`.

### Carrier approval (broker does not call this)

After the carrier runs **Calculate Analysis** on the analysis page:

```http
POST {carrierApiBase}/agentform/approveOrReject
Authorization: Bearer <carrier token>

{
  "id": 628,
  "application_status": "Approved",
  "keep_premiums": true
}
```

Or to override renewal premiums on the underwriting row:

```json
{
  "id": 628,
  "application_status": "Approved",
  "keep_premiums": false,
  "vfbl": 142503,
  "wc": 4890
}
```

Reject:

```json
{ "id": 628, "application_status": "Rejected" }
```

**Rules:**

- `application_status` must already be **`Submitted`**
- **`UnderwritingResults`** must exist for that FD + company + renewal year (Calculate Analysis was run)
- Sets `status` to **`Approved`** or **`Rejected`** only (does **not** re-run extraction)
- After **`Approved`**, broker **`update`** calls are blocked

### Recommended broker UI flow

```text
Create form (submit) → application_status In_Progress
Each page Next/Save → update with In_Progress + page data
Last page complete   → mark-submitted (Submitted) → carrier list shows form
Carrier              → View Analytics → Calculate Analysis → Approve/Reject
```

### Fields written on broker extraction (not carrier API)

See **`BROKER_FORM_EXTRACTION.md`** — including **`underwriting.form_id`** = `Form_Data.id`.

Losses, LAE, and claims are **not** from the broker form; carrier enters those on the analysis page.

---

## Testing

- Opening a renewal form from the carrier should load data, show only Previous/Next when `isHideButtons=true`, and keep fields read-only when `isReadOnly=true`.
- Initial and renewal forms should behave the same when opened from the carrier.
- Broker: per-page `update` leaves DB underwriting unchanged; `mark-submitted` creates/updates renewal row.
- Carrier: approve without Calculate Analysis returns **400** `ANALYSIS_REQUIRED`.
