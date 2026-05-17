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

## Testing

- Opening a renewal form from the carrier should load data, show only Previous/Next when `isHideButtons=true`, and keep fields read-only when `isReadOnly=true`.
- Initial and renewal forms should behave the same when opened from the carrier.
