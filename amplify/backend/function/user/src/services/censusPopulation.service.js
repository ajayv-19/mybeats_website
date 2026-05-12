/**
 * US Census Bureau API helper for cross-verifying a fire department's stored
 * `population` against the official county-level population.
 *
 * Source: American Community Survey 5-year estimates (ACS5), variable
 * `B01003_001E` (total population). Latest year normally available: ACS5 2023.
 *
 * IMPORTANT — Census API now requires a free API key on every request. Without
 * a key the endpoint returns an HTML "Missing Key" page instead of JSON.
 *   1. Sign up here (instant, free): https://api.census.gov/data/key_signup.html
 *   2. Set the resulting key as the `CENSUS_API_KEY` environment variable on
 *      the `user` Lambda (Amplify console → Functions → user → Environment
 *      variables, or add it under `Resources.LambdaFunction.Properties
 *      .Environment.Variables.CENSUS_API_KEY` in `user-cloudformation-template
 *      .json` so it's reproducible).
 *
 * Endpoint shape:
 *   GET https://api.census.gov/data/{year}/acs/acs5
 *       ?get=NAME,B01003_001E&for=county:*&in=state:{stateFips}&key={CENSUS_API_KEY}
 *
 * Response is an array-of-arrays, first row = header. Example:
 *   [ ["NAME","B01003_001E","state","county"],
 *     ["Clarke County, Georgia","128331","13","059"], ... ]
 *
 * Non-US counties (e.g. fire departments in Canada) are not covered; the
 * helper returns null in that case so the caller can skip persistence.
 */

const ACS5_DEFAULT_YEAR = 2023;
/**
 * Years to try in order. The newest ACS5 release lands every December for
 * the previous calendar year; before that the URL for the in-flight year
 * returns an HTML error page (which broke earlier `res.json()` calls with
 * "Unexpected token < in JSON"). We probe newer first, then fall back.
 */
const ACS5_FALLBACK_YEARS = [2023, 2022, 2021];

/** Full state name → FIPS (lowercased keys for case-insensitive lookup). */
const STATE_NAME_TO_FIPS = {
  alabama: "01",
  alaska: "02",
  arizona: "04",
  arkansas: "05",
  california: "06",
  colorado: "08",
  connecticut: "09",
  delaware: "10",
  "district of columbia": "11",
  florida: "12",
  georgia: "13",
  hawaii: "15",
  idaho: "16",
  illinois: "17",
  indiana: "18",
  iowa: "19",
  kansas: "20",
  kentucky: "21",
  louisiana: "22",
  maine: "23",
  maryland: "24",
  massachusetts: "25",
  michigan: "26",
  minnesota: "27",
  mississippi: "28",
  missouri: "29",
  montana: "30",
  nebraska: "31",
  nevada: "32",
  "new hampshire": "33",
  "new jersey": "34",
  "new mexico": "35",
  "new york": "36",
  "north carolina": "37",
  "north dakota": "38",
  ohio: "39",
  oklahoma: "40",
  oregon: "41",
  pennsylvania: "42",
  "rhode island": "44",
  "south carolina": "45",
  "south dakota": "46",
  tennessee: "47",
  texas: "48",
  utah: "49",
  vermont: "50",
  virginia: "51",
  washington: "53",
  "west virginia": "54",
  wisconsin: "55",
  wyoming: "56",
  "puerto rico": "72",
};

/** USPS 2-letter code → FIPS (lowercased keys). */
const STATE_ABBR_TO_FIPS = {
  al: "01",
  ak: "02",
  az: "04",
  ar: "05",
  ca: "06",
  co: "08",
  ct: "09",
  de: "10",
  dc: "11",
  fl: "12",
  ga: "13",
  hi: "15",
  id: "16",
  il: "17",
  in: "18",
  ia: "19",
  ks: "20",
  ky: "21",
  la: "22",
  me: "23",
  md: "24",
  ma: "25",
  mi: "26",
  mn: "27",
  ms: "28",
  mo: "29",
  mt: "30",
  ne: "31",
  nv: "32",
  nh: "33",
  nj: "34",
  nm: "35",
  ny: "36",
  nc: "37",
  nd: "38",
  oh: "39",
  ok: "40",
  or: "41",
  pa: "42",
  ri: "44",
  sc: "45",
  sd: "46",
  tn: "47",
  tx: "48",
  ut: "49",
  vt: "50",
  va: "51",
  wa: "53",
  wv: "54",
  wi: "55",
  wy: "56",
  pr: "72",
};

function normalizeStateToFips(stateRaw) {
  if (!stateRaw) return null;
  const trimmed = String(stateRaw).trim().toLowerCase();
  if (!trimmed) return null;
  if (STATE_NAME_TO_FIPS[trimmed]) return STATE_NAME_TO_FIPS[trimmed];
  if (STATE_ABBR_TO_FIPS[trimmed]) return STATE_ABBR_TO_FIPS[trimmed];
  return null;
}

/** Loose county-name match. Census `NAME` is "Clarke County, Georgia",
 * "St. Louis city, Missouri", "Anchorage Municipality, Alaska", etc.
 * The carrier stores just "Clarke" or "Clarke County" — match by lowercase
 * prefix of `<county>` against everything before the comma. */
function countyNameMatches(censusName, requestedCounty) {
  if (!censusName || !requestedCounty) return false;
  const beforeComma = censusName.split(",")[0] || "";
  const want = String(requestedCounty).trim().toLowerCase().replace(/\s+/g, " ");
  const have = beforeComma.toLowerCase().replace(/\s+/g, " ");

  if (have.startsWith(want)) return true;
  if (have.startsWith(`${want} county`)) return true;
  if (have.startsWith(`${want} parish`)) return true;
  if (have.startsWith(`${want} borough`)) return true;
  if (have.startsWith(`${want} census area`)) return true;
  if (have.startsWith(`${want} municipality`)) return true;
  if (have.startsWith(`${want} city`)) return true;
  return false;
}

/** Build the ACS5 county-population URL for a state FIPS + year. */
function buildAcs5Url({ stateFips, year, apiKey }) {
  const params = new URLSearchParams({
    get: "NAME,B01003_001E",
    for: "county:*",
    in: `state:${stateFips}`,
  });
  if (apiKey) params.set("key", apiKey);
  return `https://api.census.gov/data/${year}/acs/acs5?${params.toString()}`;
}

const KEY_SIGNUP_URL = "https://api.census.gov/data/key_signup.html";

/** Map Census's HTML error pages to friendly, actionable error messages. */
function classifyCensusHtmlError(htmlBody) {
  const lower = String(htmlBody || "").toLowerCase();
  if (lower.includes("missing key") || lower.includes("a valid <em>key</em>")) {
    return `Census API requires an API key. Register a free key at ${KEY_SIGNUP_URL} and set it as the CENSUS_API_KEY environment variable on the 'user' Lambda.`;
  }
  if (lower.includes("invalid key") || lower.includes("invalid api key")) {
    return `Census API rejected the configured CENSUS_API_KEY as invalid. Re-check the value (no quotes / whitespace) or request a new key at ${KEY_SIGNUP_URL}.`;
  }
  return null;
}

/** Hit the Census ACS5 endpoint and return the parsed array-of-arrays.
 * Reads the response as text first so we can recognize HTML error pages
 * (which used to crash `res.json()` with "Unexpected token <") and return
 * a clean structured error the caller can either log or fall through.
 */
async function fetchAcs5Json(url) {
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  const text = await res.text().catch(() => "");
  if (!res.ok) {
    const friendly = classifyCensusHtmlError(text);
    const err = new Error(
      friendly ||
        `Census API ${res.status} ${res.statusText}: ${text.slice(0, 200)}`,
    );
    err.status = res.status;
    err.body = text;
    err.keyError = !!friendly;
    throw err;
  }
  // Census returns plain JSON arrays; an HTML body here means either the key
  // is missing/invalid, or the dataset for that year isn't published yet.
  const trimmed = text.trim();
  if (!trimmed.startsWith("[")) {
    const friendly = classifyCensusHtmlError(trimmed);
    const err = new Error(
      friendly ||
        `Census API returned non-JSON body (likely HTML error page): ${trimmed.slice(0, 200)}`,
    );
    err.nonJson = true;
    err.keyError = !!friendly;
    err.body = trimmed;
    throw err;
  }
  try {
    return JSON.parse(trimmed);
  } catch (parseErr) {
    const err = new Error(
      `Census API JSON parse failed: ${parseErr.message} — body: ${trimmed.slice(0, 200)}`,
    );
    err.nonJson = true;
    err.body = trimmed;
    throw err;
  }
}

/**
 * Fetch the ACS5 county population for the given state + county names.
 * @param {object} opts
 * @param {string} opts.state - state name ("New York") or USPS code ("NY")
 * @param {string} opts.county - county name as stored on `fire_departments.county`
 * @param {number} [opts.year] - ACS5 year (default 2023); on failure we
 *                                automatically fall back to older years.
 * @returns {Promise<null | {
 *   population: number,
 *   source: string,
 *   state_fips: string,
 *   county_fips: string,
 *   name: string,
 *   year: number,
 * }>}
 *
 * Returns `null` when state can't be resolved (non-US) or no county matches.
 * Throws only when ALL fallback years fail (so the caller sees a real outage).
 */
async function fetchCountyPopulationFromCensus({ state, county, year } = {}) {
  const stateFips = normalizeStateToFips(state);
  if (!stateFips) return null; // non-US (Canada etc.) or unrecognized state
  if (!county || !String(county).trim()) return null;

  const apiKey = process.env.CENSUS_API_KEY;
  if (!apiKey) {
    // Census now refuses every request without a key; fail fast with a
    // clear message instead of probing each fallback year.
    const err = new Error(
      `CENSUS_API_KEY environment variable is not set on the Lambda. Register a free key at ${KEY_SIGNUP_URL} and add it to the 'user' Lambda's environment variables (see censusPopulation.service.js header for setup).`,
    );
    err.keyError = true;
    throw err;
  }

  const yearsToTry = [];
  if (Number.isFinite(year)) yearsToTry.push(year);
  for (const y of ACS5_FALLBACK_YEARS) {
    if (!yearsToTry.includes(y)) yearsToTry.push(y);
  }

  let lastErr = null;
  for (const yr of yearsToTry) {
    const url = buildAcs5Url({ stateFips, year: yr, apiKey });
    let body;
    try {
      body = await fetchAcs5Json(url);
    } catch (err) {
      lastErr = err;
      // Key errors will fail identically for every year — surface immediately.
      if (err.keyError) throw err;
      // 404 or HTML "year not published yet" → try the next older year.
      if (err.status === 404 || err.nonJson) continue;
      // 5xx / network → also try fallback rather than failing immediately.
      if (err.status >= 500) continue;
      throw err;
    }

    if (!Array.isArray(body) || body.length < 2) {
      // No rows for this year, try the next.
      continue;
    }

    // body[0] is the header: ["NAME","B01003_001E","state","county"]
    const rows = body.slice(1);
    const match = rows.find((row) => countyNameMatches(row[0], county));
    if (!match) {
      // We did reach a published year; no point retrying older ones — the
      // state has data, the county just doesn't match.
      return null;
    }

    const pop = parseInt(match[1], 10);
    if (!Number.isFinite(pop)) return null;

    return {
      population: pop,
      source: `ACS5 ${yr}`,
      state_fips: match[2],
      county_fips: match[3],
      name: match[0],
      year: yr,
    };
  }

  // Every fallback year failed.
  if (lastErr) {
    throw new Error(`Census API request failed: ${lastErr.message}`);
  }
  return null;
}

module.exports = {
  fetchCountyPopulationFromCensus,
  normalizeStateToFips,
  ACS5_DEFAULT_YEAR,
};
