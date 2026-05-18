/**
 * Carrier portal — form extraction MOVED TO BROKER (brokerapi).
 * See BROKER_FORM_EXTRACTION.md in repo root.
 *
 * This file keeps:
 * - extractPolicyYear / flattenFormData (used by carrier mark-submitted validation)
 * - updateRenewalYearPremiums (carrier approve optional premium override)
 *
 * extractFormData / extractUnderwritingData / extractProfileData are commented below as reference only.
 */

const { Underwriting } = require("../models");

/**
 * Extract policy year from effective_date
 * If month >= 6 (July-Dec): YYYY-(YYYY+1)
 * If month < 6 (Jan-Jun): (YYYY-1)-YYYY
 */
function extractPolicyYear(effectiveDate) {
  if (!effectiveDate) return null;

  const date = new Date(effectiveDate);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  if (month >= 6) {
    return `${year}-${year + 1}`;
  }
  return `${year - 1}-${year}`;
}

function parseDecimal(value) {
  if (!value || value === "" || value === null) return null;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? null : parsed;
}

function flattenFormData(formDataArray) {
  if (!Array.isArray(formDataArray)) return {};

  const flattened = {};
  formDataArray.forEach((section) => {
    if (section && section.data) {
      Object.assign(flattened, section.data);
    }
  });

  return flattened;
}

/**
 * Update renewal-year VFBL/WC on underwriting (carrier approval override only).
 */
async function updateRenewalYearPremiums(
  fireDepartmentId,
  companyId,
  underwritingYear,
  vfbl,
  wc,
  transaction,
) {
  const vfblNum = parseDecimal(vfbl);
  const wcNum = parseDecimal(wc);
  if (vfblNum === null || wcNum === null) {
    throw new Error("vfbl and wc are required when updating renewal premiums");
  }
  const totalPremium = vfblNum + wcNum;
  const [count] = await Underwriting.update(
    {
      vfbl: vfblNum,
      wc: wcNum,
      total_premium: totalPremium,
    },
    {
      where: {
        fire_department_id: fireDepartmentId,
        company_id: companyId,
        underwriting_year: underwritingYear,
      },
      transaction,
    },
  );
  if (count === 0) {
    throw new Error(
      `No underwriting row for year ${underwritingYear}; broker extraction must create it on mark-submitted (see BROKER_FORM_EXTRACTION.md)`,
    );
  }
}

/*
 * ─── BROKER OWNS EXTRACTION BELOW (reference only — do not uncomment on carrier) ───
 *
async function extractUnderwritingData(...) {
  // vfbl_premium, wc_premium → underwriting; form_id = Form_Data.id
  // upsert conflict: fire_department_id + underwriting_year
}
async function extractProfileData(...) { ... }
async function extractFormData(formId, updatedBy) { ... }
 *
 * Full spec: BROKER_FORM_EXTRACTION.md
 * ─────────────────────────────────────────────────────────────────────────────
 */

module.exports = {
  updateRenewalYearPremiums,
  extractPolicyYear,
  flattenFormData,
};
