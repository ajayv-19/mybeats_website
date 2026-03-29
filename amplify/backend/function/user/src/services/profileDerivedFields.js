/**
 * Persisted profile fields derived from application / manual entry.
 * Density = round(population ÷ square miles) persons per sq mi, stored as INTEGER.
 * Total calls = fire_calls + EMS calls (treat missing addend as 0 when the other is present).
 */

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
  computeProfileDensity,
  computeProfileTotalCalls,
};
