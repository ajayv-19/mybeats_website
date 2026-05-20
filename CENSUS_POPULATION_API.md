# US Census population verification (disabled)

County-level Census ACS5 verification is **turned off** in the carrier app. Population for underwriting uses the **fire department profile** value (`fire_department_profile.population`) from the broker renewal/initial form or carrier **Edit profile** — not US Census county totals.

## Why it was disabled

- Census returns **county** population (`B01003_001E`), not **individual fire district** served population.
- VFBL rating uses district/home-area population from the application, which often differs from county-wide ACS5 figures.

## Files to re-enable

| Layer | File | What to uncomment |
| ----- | ---- | ----------------- |
| Backend route | `amplify/backend/function/user/src/controllers/analysis.controller.js` | `app.post("/analysis/.../verify-population", ...)` |
| Backend handler | Same file | `async verifyPopulation(req, res) { ... }` and `require("../services/censusPopulation.service")` |
| Backend service | `amplify/backend/function/user/src/services/censusPopulation.service.js` | Full file (unchanged when disabled) |
| Frontend hook | `src/app/main/apps/settings/apis/AnalysisApis.ts` | `VerifyPopulationResponse`, `useVerifyPopulation` |
| Frontend UI | `src/app/main/apps/analysis/AnalysisDetail.tsx` | `useVerifyPopulation` import/hook + Census badge/buttons block under Population |

## API (when enabled)

**Endpoint:** `POST /analysis/:fire_department_id/verify-population?company_id={id}`

**External:** US Census Bureau ACS5  
`GET https://api.census.gov/data/{year}/acs/acs5?get=NAME,B01003_001E&for=county:*&in=state:{fips}&key={CENSUS_API_KEY}`

**Env:** `CENSUS_API_KEY` on the `user` Lambda (free key: https://api.census.gov/data/key_signup.html)

**DB:** Writes `fire_department_profile.population_verified` (county total); does not change `population` unless the user clicks **Use Census value** in the UI.

## Lookup logic (reference)

- Resolves `fire_departments.state` + `fire_departments.county` → state FIPS → all counties in state → name match (`Seneca` ↔ `Seneca County, New York`).
- Default years tried: 2023, 2022, 2021.

## Future: per fire department population

If re-enabling, consider a **district-level** source (tax rolls, GIS, 911, census tract sum) instead of county ACS5, or only show Census as read-only reference without overwriting `population`.
