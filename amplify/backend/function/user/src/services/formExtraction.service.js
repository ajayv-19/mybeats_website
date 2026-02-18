const { FormData, FireDepartment, FireDepartmentProfile, Underwriting, sequelize } = require("../models");
const { Op } = require("sequelize");

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
 * Get previous underwriting year (e.g. "2026-2027" -> "2025-2026")
 */
function getPreviousUnderwritingYear(underwritingYear) {
  if (!underwritingYear || typeof underwritingYear !== 'string') return null;
  const parts = underwritingYear.split('-');
  if (parts.length !== 2) return null;
  const y1 = parseInt(parts[0], 10);
  const y2 = parseInt(parts[1], 10);
  if (isNaN(y1) || isNaN(y2)) return null;
  return `${y1 - 1}-${y2 - 1}`;
}

/**
 * Extract and store underwriting data from form.
 * Initial: create row with vfbl_premium, wc_premium → vfbl, wc, total_premium = VFBL + WC.
 * Renewal: create NEW row; copy vfbl and wc from previous year's row; total_premium = VFBL + WC.
 * losses, lae, total_loss_lae, loss_ratio, points, number_of_claims, pr_factor are NOT from form (agent enters later).
 */
async function extractUnderwritingData(form, flattenedData, fireDepartmentId, companyId, underwritingYear, formType, formId, transaction) {
  const isInitial = (formType || '').toLowerCase() === 'initial';

  if (isInitial) {
    const vfbl = parseDecimal(flattenedData.vfbl_premium);
    const wc = parseDecimal(flattenedData.wc_premium);
    const totalPremium = (vfbl !== null && wc !== null) ? vfbl + wc : null;

    await Underwriting.upsert({
      fire_department_id: fireDepartmentId,
      company_id: companyId,
      underwriting_year: underwritingYear,
      form_id: formId,
      type: formType,
      vfbl: vfbl,
      wc: wc,
      total_premium: totalPremium,
    }, {
      transaction,
      conflictFields: ['fire_department_id', 'underwriting_year'],
      updateOnDuplicate: ['company_id', 'form_id', 'type', 'vfbl', 'wc', 'total_premium'],
    });
  } else {
    // Renewal: create NEW row. Copy vfbl and wc from previous year's underwriting row.
    const prevYear = getPreviousUnderwritingYear(underwritingYear);
    let vfbl = null;
    let wc = null;
    if (prevYear) {
      const prevRow = await Underwriting.findOne({
        where: {
          fire_department_id: fireDepartmentId,
          company_id: companyId,
          underwriting_year: prevYear,
        },
        transaction,
      });
      if (prevRow) {
        vfbl = prevRow.vfbl != null ? Number(prevRow.vfbl) : null;
        wc = prevRow.wc != null ? Number(prevRow.wc) : null;
      }
    }
    const totalPremium = (vfbl != null && wc != null) ? vfbl + wc : null;

    await Underwriting.upsert({
      fire_department_id: fireDepartmentId,
      company_id: companyId,
      underwriting_year: underwritingYear,
      form_id: formId,
      type: formType,
      vfbl: vfbl,
      wc: wc,
      total_premium: totalPremium,
    }, {
      transaction,
      conflictFields: ['fire_department_id', 'underwriting_year'],
      updateOnDuplicate: ['company_id', 'form_id', 'type', 'vfbl', 'wc', 'total_premium'],
    });
  }

  return Underwriting.findOne({
    where: { fire_department_id: fireDepartmentId, underwriting_year: underwritingYear },
    transaction,
  });
}

/**
 * Extract and store fire department profile data from form.
 * Common fields (both initial & renewal): population, square_mileage, fire_calls, ems_calls,
 * racing_motorized, safety_officer_count, safety_committee, effective_date.
 * Initial only: broker_name → agent. Renewal: keep existing agent or null.
 */
async function extractProfileData(form, flattenedData, fireDepartmentId, companyId, effectiveDate, updatedBy, formType, transaction) {
  const isInitial = (formType || '').toLowerCase() === 'initial';

  // Common fields (both forms) - from population/coverage and safety sections
  const population = parseInteger(flattenedData.population);
  const squareMiles = parseDecimal(flattenedData.square_mileage);
  const fireCalls = parseInteger(flattenedData.fire_calls);
  const emsCalls = parseInteger(flattenedData.ems_calls);
  // motorized_racing_team: initial has racing_motorized "on"; renewal has racing_team "motorized"
  const motorizedRacingTeam =
    parseBoolean(flattenedData.racing_motorized) ||
    (String(flattenedData.racing_team || '').toLowerCase() === 'motorized');
  const hsOfficers = parseInteger(flattenedData.safety_officer_count);
  const safetyCommittee = parseBoolean(flattenedData.safety_committee);

  // agent: initial from broker_name; renewal from Form_Data.updated_by (or approver updatedBy)
  let brokerName = flattenedData.broker_name || null;
  if (!isInitial) brokerName = null;
  
  // effective_from: from form effective_date (page 1); renewal_date: effective_date + 1 year
  const effectiveFrom = effectiveDate ? new Date(effectiveDate) : new Date();
  const renewalDate = effectiveDate ? new Date(effectiveDate) : null;
  if (renewalDate) {
    renewalDate.setFullYear(renewalDate.getFullYear() + 1);
  }
  
  // Check if current profile exists for this company
  const currentProfile = await FireDepartmentProfile.findOne({
    where: {
      fire_department_id: fireDepartmentId,
      company_id: companyId,
      effective_to: null,
    },
    transaction,
  });
  
  // Determine customer_since; for renewal keep existing agent if we're not setting broker_name
  let customerSince = effectiveDate ? new Date(effectiveDate) : null;
  if (currentProfile && currentProfile.customer_since) {
    customerSince = currentProfile.customer_since;
  }
  // agent: initial = broker_name; renewal = form.updated_by (submitter) or updatedBy (approver)
  let agentValue = brokerName;
  if (!isInitial) {
    agentValue = form.updated_by || updatedBy || (currentProfile && currentProfile.agent) || null;
  }
  
  // Check if values changed
  let valuesChanged = false;
  if (!currentProfile) {
    valuesChanged = true; // No profile exists, create one
  } else {
    // Compare values (convert dates to strings for comparison)
    const currentValuationDate = currentProfile.valuation_date ? 
      new Date(currentProfile.valuation_date).toISOString().split('T')[0] : null;
    const currentRenewalDate = currentProfile.renewal_date ? 
      new Date(currentProfile.renewal_date).toISOString().split('T')[0] : null;
    const newValuationDate = effectiveDate ? 
      new Date(effectiveDate).toISOString().split('T')[0] : null;
    const newRenewalDateStr = renewalDate ? 
      renewalDate.toISOString().split('T')[0] : null;
    
    // Compare numeric values (handle string decimals from DB)
    const currentSquareMiles = currentProfile.square_miles !== null ? 
      parseFloat(currentProfile.square_miles) : null;
    
    valuesChanged =
      currentProfile.population !== population ||
      currentSquareMiles !== squareMiles ||
      currentProfile.fire_calls !== fireCalls ||
      currentProfile.ems_calls !== emsCalls ||
      currentProfile.motorized_racing_team !== motorizedRacingTeam ||
      currentProfile.hs_officers !== hsOfficers ||
      currentProfile.safety_committee !== safetyCommittee ||
      currentProfile.agent !== agentValue ||
      currentValuationDate !== newValuationDate ||
      currentRenewalDate !== newRenewalDateStr;
  }
  
  if (valuesChanged) {
    // Close old record (if exists)
    if (currentProfile) {
      await FireDepartmentProfile.update(
        { effective_to: effectiveFrom },
        {
          where: {
            fire_department_id: fireDepartmentId,
            company_id: companyId,
            effective_to: null,
          },
          transaction,
        }
      );
    }
    
    // Insert new record
    const newProfile = await FireDepartmentProfile.create({
      fire_department_id: fireDepartmentId,
      company_id: companyId,
      population: population,
      square_miles: squareMiles,
      fire_calls: fireCalls,
      ems_calls: emsCalls,
      motorized_racing_team: motorizedRacingTeam,
      hs_officers: hsOfficers,
      safety_committee: safetyCommittee,
      customer_since: customerSince,
      renewal_date: renewalDate,
      valuation_date: effectiveDate ? new Date(effectiveDate) : null,
      agent: agentValue,
      effective_from: effectiveFrom,
      effective_to: null,
      updated_by: updatedBy,
    }, { transaction });
    
    return newProfile;
  } else {
    // Values unchanged, return existing profile
    return currentProfile;
  }
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
    
    // Flatten form data first so we can read fire_department_id from JSON (renewal sends it)
    const formDataArray = form.data;
    const flattenedData = flattenFormData(formDataArray);

    const formType = (form.type || '').toLowerCase(); // "initial" or "renewal"

    // Get fire_department_id: from Form_Data, from JSON (renewal), or create from fire_department name
    let fireDepartmentId = form.fire_department_id;
    const fdIdFromData = parseInteger(flattenedData.fire_department_id);
    if (fdIdFromData != null) {
      fireDepartmentId = fdIdFromData;
      if (form.fire_department_id !== fireDepartmentId) {
        await FormData.update(
          { fire_department_id: fireDepartmentId },
          { where: { id: formId }, transaction }
        );
      }
    }
    if (!fireDepartmentId && form.fire_department) {
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
      await FormData.update(
        { fire_department_id: fireDepartmentId },
        { where: { id: formId }, transaction }
      );
    }
    if (!fireDepartmentId) {
      throw new Error("Cannot determine fire_department_id for form");
    }
    
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
    
    // Extract underwriting data (initial: vfbl/wc/total_premium; renewal: row exists, no premium overwrite)
    await extractUnderwritingData(
      form,
      flattenedData,
      fireDepartmentId,
      form.company_id,
      underwritingYear,
      formType,
      formId,
      transaction
    );

    // Extract profile data (common fields + agent from initial only)
    await extractProfileData(
      form,
      flattenedData,
      fireDepartmentId,
      form.company_id,
      effectiveDate,
      updatedBy,
      formType,
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
