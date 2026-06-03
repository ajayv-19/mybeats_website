/**
 * Persisted profile fields derived from application / manual entry.
 * Density = round(population ÷ square miles) persons per sq mi, stored as INTEGER.
 * Total calls = fire_calls + EMS calls (treat missing addend as 0 when the other is present).
 */

/** Broker may version profiles by effective_from; always use the newest row. */
const LATEST_PROFILE_ORDER = [["id", "DESC"]];

function parseProfileDecimal(value) {
  if (value === null || value === undefined || value === "") return null;
  const raw =
    typeof value === "object" && value !== null && typeof value.toString === "function"
      ? value.toString()
      : value;
  const n = parseFloat(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : null;
}

function parseProfileInteger(value) {
  if (value === null || value === undefined || value === "") return null;
  const raw =
    typeof value === "object" && value !== null && typeof value.toString === "function"
      ? value.toString()
      : value;
  const n = parseInt(String(raw).replace(/,/g, "").trim(), 10);
  return Number.isFinite(n) ? n : null;
}

/** Square miles must be > 0; invalid/empty/zero does not overwrite an existing value. */
function parseSquareMiles(value) {
  const n = parseProfileDecimal(value);
  if (n == null || n <= 0) return null;
  return n;
}

/** Normalize DECIMAL fields for JSON responses (pg/sequelize often return strings). */
function serializeProfileRow(profile) {
  if (!profile) return null;
  const plain = profile.get ? profile.get({ plain: true }) : { ...profile };
  if (plain.square_miles != null && plain.square_miles !== "") {
    plain.square_miles = parseSquareMiles(plain.square_miles);
  }
  if (plain.density != null && plain.density !== "") {
    const d = parseProfileInteger(plain.density);
    plain.density = d != null && d > 0 ? d : null;
  }
  return plain;
}

function computeProfileDensity(population, squareMiles) {
  if (population == null || squareMiles == null) return null;
  const sm =
    typeof squareMiles === "number"
      ? squareMiles
      : parseFloat(String(squareMiles).replace(/,/g, ""));
  if (!Number.isFinite(sm) || sm <= 0) return null;
  const d = Number(population) / sm;
  if (!Number.isFinite(d)) return null;
  return Math.round(d);
}

function computeProfileTotalCalls(fireCalls, emsCalls) {
  if (fireCalls == null && emsCalls == null) return null;
  const f = Math.trunc(Number(fireCalls));
  const e = Math.trunc(Number(emsCalls));
  const fOk = Number.isFinite(f) ? f : 0;
  const eOk = Number.isFinite(e) ? e : 0;
  return fOk + eOk;
}

module.exports = {
  LATEST_PROFILE_ORDER,
  parseProfileDecimal,
  parseProfileInteger,
  parseSquareMiles,
  serializeProfileRow,
  computeProfileDensity,
  computeProfileTotalCalls,
};
