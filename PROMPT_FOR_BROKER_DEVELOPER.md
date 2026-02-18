# Prompt for Broker Website Developer

## Task

Make `renewal.html` behave the same as `form.html` when the form is opened from the carrier portal (in an iframe). Right now renewal does not load form data; initial does.

---

## What the carrier sends in the URL

- `company_id` – company ID  
- `editFormId` – form ID to load  
- `isReadOnly` – `"true"` when the form should be read-only  
- `isHideButtons` – `"true"` when only Previous and Next should work  
- `carrierApiBase` – URL-encoded base URL for the carrier API  

---

## What to implement (same for form.html and renewal.html)

1. **Read URL parameters**  
   Use `editFormId`, `isReadOnly`, `isHideButtons`, and `carrierApiBase` from the page URL.

2. **When `isHideButtons=true`**  
   Only **Previous** and **Next** must stay visible and work. Hide or disable Submit, Print, and any other buttons.

3. **When `isReadOnly=true`**  
   Disable or make read-only all form fields so the user cannot edit.

4. **When `editFormId` is present**  
   Call `GET {carrierApiBase}/agentform/{editFormId}` and populate the form from the response.  
   Response has `data.data`: array of `{ formNumber, data }`. Map each to the right page and fill fields by name.

5. **Listen for postMessage**  
   Handle messages with `event.data.type === 'CARRIER_FORM_DATA'` and use `event.data.data` (same structure as API) to populate the form as a backup.

---

## What renewal.html must get in line with form.html

- Same URL parameter handling.  
- Same button behavior (only Previous and Next when `isHideButtons=true`).  
- Same read-only behavior when `isReadOnly=true`.  
- **Call the API to load form data when `editFormId` is present** (this is what renewal is missing).  
- Same form population from API and from postMessage.

---

## Expected result

- Renewal form opens from carrier with data loaded.  
- Only Previous and Next work when `isHideButtons=true`; Submit/Print hidden.  
- Fields are read-only when `isReadOnly=true`.  
- Initial and renewal behave the same from the carrier.

---

For more detail (no code, only requirements), see `BROKER_FORM_INTEGRATION.md` in the carrier portal repo.
