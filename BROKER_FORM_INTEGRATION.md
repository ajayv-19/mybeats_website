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

- If you need to populate a fire departments dropdown, call `GET {carrierApiBase}/fire-departments`.
- You can provide `company_id` directly: `GET {carrierApiBase}/fire-departments?company_id={company_id}` (extract `company_id` from URL parameters).
- Alternatively, if you have `editFormId`, you can use: `GET {carrierApiBase}/fire-departments?editFormId={editFormId}` (the API will extract `company_id` from the form).
- Response has `data`: an array of fire departments with `fire_department_id`, `fire_department_name`, `county`, `state`, `company_id`.

### 5. postMessage as backup data source

- Listen for `message` events where `event.data.type === 'CARRIER_FORM_DATA'`.
- Use `event.data.data` (same shape as API: e.g. `data` array of `{ formNumber, data }`) to populate the form.
- Carrier sends this on iframe load and retries at 100ms and 500ms, so a late-attached listener can still receive it.

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

## Testing

- Opening a renewal form from the carrier should load data, show only Previous/Next when `isHideButtons=true`, and keep fields read-only when `isReadOnly=true`.
- Initial and renewal forms should behave the same when opened from the carrier.
