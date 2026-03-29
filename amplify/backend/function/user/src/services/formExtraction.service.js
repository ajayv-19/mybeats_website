const { FormData, FireDepartment, FireDepartmentProfile, Underwriting, sequelize } = require("../models");
const {
  computeProfileDensity,
  computeProfileTotalCalls,
} = require("./profileDerivedFields");

/**
 * Extract policy year from effective_date
 * If month >= 6 (July-Dec): YYYY-(YYYY+1)
 * If month < 6 (Jan-Jun): (YYYY-1)-YYYY
 */
function extractPolicyYear(effectiveDate) {
  if (!effectiveDate) return null;

  const date = new Date(effectiveDate);
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // getMonth() returns 0-11

  if (month >= 6) {
    return `${year}-${year + 1}`;
  } else {
    return `${year - 1}-${year}`;
  }
}

/**
 * Parse decimal value from string
 */
function parseDecimal(value) {
  if (!value || value === "" || value === null) return null;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Parse integer value from string
 */
function parseInteger(value) {
  if (!value || value === "" || value === null) return null;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Parse boolean value from string
 */
function parseBoolean(value) {
  if (!value || value === "" || value === null) return false;
  const lower = String(value).toLowerCase();
  return lower === "on" || lower === "yes" || lower === "true" || lower === "1";
}

/**
 * Flatten form data from array of sections into single object
 */
function flattenFormData(formDataArray) {
  if (!Array.isArray(formDataArray)) return {};

  const flattened = {};
  formDataArray.forEach(section => {
    if (section && section.data) {
      Object.assign(flattened, section.data);
    }
  });

  return flattened;
}

/**
 * Extract and store underwriting data from form
 */
async function extractUnderwritingData(form, flattenedData, fireDepartmentId, companyId, underwritingYear, transaction) {
  const vfbl = parseDecimal(flattenedData.vfbl_premium);
  const wc = parseDecimal(flattenedData.wc_premium);

  // Calculate total_premium only if both values are valid
  const totalPremium = (vfbl !== null && wc !== null) ? vfbl + wc : null;

  // Use INSERT ... ON CONFLICT DO UPDATE pattern
  const [underwriting, created] = await Underwriting.upsert({
    fire_department_id: fireDepartmentId,
    company_id: companyId,
    underwriting_year: underwritingYear,
    vfbl: vfbl,
    wc: wc,
    total_premium: totalPremium,
    // Do NOT update these fields (set by carrier later):
    // losses, lae, total_loss_lae, loss_ratio, points, pr_factor, number_of_claims
  }, {
    transaction,
    conflictFields: ['fire_department_id', 'underwriting_year'],
    updateOnDuplicate: ['company_id', 'vfbl', 'wc', 'total_premium'],
  });

  return underwriting;
}

/**
 * Extract and store fire department profile data from form.
 * One row per (fire_department_id, company_id): renewal approvals UPDATE that row (no new SCD row).
 */
async function extractProfileData(form, flattenedData, fireDepartmentId, companyId, effectiveDate, updatedBy, transaction) {
  const population = parseInteger(flattenedData.population);
  const squareMiles = parseDecimal(flattenedData.square_mileage);
  const fireCalls = parseInteger(flattenedData.fire_calls);
  const emsCalls = parseInteger(flattenedData.ems_calls);
  const motorizedRacingCount = parseInteger(flattenedData.racing_motorized_count);
  const motorizedRacingTeam =
    parseBoolean(flattenedData.racing_motorized) ||
    (motorizedRacingCount != null && motorizedRacingCount > 0);
  const hsOfficers = parseInteger(flattenedData.safety_officer_count);
  const safetyCommittee = parseBoolean(flattenedData.safety_committee);
  const brokerName = flattenedData.broker_name || null;

  const renewalDate = effectiveDate ? new Date(effectiveDate) : null;
  if (renewalDate) {
    renewalDate.setFullYear(renewalDate.getFullYear() + 1);
  }

  const existing = await FireDepartmentProfile.findOne({
    where: {
      fire_department_id: fireDepartmentId,
      company_id: companyId,
    },
    order: [["id", "DESC"]],
    transaction,
  });

  let customerSince = effectiveDate ? new Date(effectiveDate) : null;
  if (existing && existing.customer_since) {
    customerSince = existing.customer_since;
  }

  const valuationDate = effectiveDate ? new Date(effectiveDate) : null;
  const now = new Date();

  const density = computeProfileDensity(population, squareMiles);
  const totalCalls = computeProfileTotalCalls(fireCalls, emsCalls);

  const payload = {
    population,
    square_miles: squareMiles,
    fire_calls: fireCalls,
    ems_calls: emsCalls,
    density,
    total_calls: totalCalls,
    motorized_racing_team: motorizedRacingTeam,
    motorized_racing_team_count: motorizedRacingCount,
    hs_officers: hsOfficers,
    safety_committee: safetyCommittee,
    customer_since: customerSince,
    renewal_date: renewalDate,
    valuation_date: valuationDate,
    agent: brokerName,
    effective_to: null,
    updated_by: updatedBy,
    updated_at: now,
  };

  if (existing) {
    await existing.update(payload, { transaction });
    return existing;
  }

  return await FireDepartmentProfile.create(
    {
      fire_department_id: fireDepartmentId,
      company_id: companyId,
      ...payload,
      effective_from: now.toISOString().slice(0, 10),
    },
    { transaction }
  );
}

/**
 * Main extraction function - extracts form data and populates underwriting/profile tables
 */
async function extractFormData(formId, updatedBy) {
  const transaction = await sequelize.transaction();

  try {
    // Fetch form
    const form = await FormData.findByPk(formId, { transaction });
    if (!form) {
      throw new Error(`Form with id ${formId} not found`);
    }

    // Get fire_department_id (from Form_Data table or create from fire_department name)
    let fireDepartmentId = form.fire_department_id;

    if (!fireDepartmentId && form.fire_department) {
      // Find or create fire department
      const [fireDepartment] = await FireDepartment.findOrCreate({
        where: {
          fire_department_name: form.fire_department,
          company_id: form.company_id,
        },
        defaults: {
          fire_department_name: form.fire_department,
          company_id: form.company_id,
        },
        transaction,
      });
      fireDepartmentId = fireDepartment.fire_department_id;

      // Update form with fire_department_id
      await FormData.update(
        { fire_department_id: fireDepartmentId },
        { where: { id: formId }, transaction }
      );
    }

    if (!fireDepartmentId) {
      throw new Error("Cannot determine fire_department_id for form");
    }

    // Flatten form data
    const formDataArray = form.data;
    const flattenedData = flattenFormData(formDataArray);

    // Extract policy year from effective_date
    const effectiveDate = flattenedData.effective_date;
    const underwritingYear = extractPolicyYear(effectiveDate);

    if (!underwritingYear) {
      throw new Error("Cannot extract policy year from effective_date");
    }

    // Update form with year
    await FormData.update(
      { year: underwritingYear },
      { where: { id: formId }, transaction }
    );

    // Extract underwriting data
    await extractUnderwritingData(
      form,
      flattenedData,
      fireDepartmentId,
      form.company_id,
      underwritingYear,
      transaction
    );

    // Extract profile data
    await extractProfileData(
      form,
      flattenedData,
      fireDepartmentId,
      form.company_id,
      effectiveDate,
      updatedBy,
      transaction
    );

    await transaction.commit();

    return {
      success: true,
      fire_department_id: fireDepartmentId,
      underwriting_year: underwritingYear,
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

module.exports = {
  extractFormData,
  extractPolicyYear,
  flattenFormData,
};
