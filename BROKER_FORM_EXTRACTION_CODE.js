/**
 * BROKER PORTAL — copy this file into brokerapi (adjust require paths to your models).
 * e.g. amplify/backend/function/brokerapi/src/services/form-data-sync.service.js
 *
 * Call extractFormData(formId, updatedBy) from POST /brokerapi/agentform/mark-submitted
 * AFTER saving final page data to Form_Data, BEFORE or AFTER carrier mark-submitted.
 *
 * Requires same Sequelize models/tables as carrier: FormData, FireDepartment,
 * FireDepartmentProfile, Underwriting, sequelize
 */

// const { FormData, FireDepartment, FireDepartmentProfile, Underwriting, sequelize } = require("../models");

// ─── profileDerivedFields.js (copy or require from shared util) ───

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

// ─── helpers ───

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

function parseInteger(value) {
  if (!value || value === "" || value === null) return null;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? null : parsed;
}

function parseBoolean(value) {
  if (!value || value === "" || value === null) return false;
  const lower = String(value).toLowerCase();
  return lower === "on" || lower === "yes" || lower === "true" || lower === "1";
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

// ─── underwriting row (includes form_id) ───

async function extractUnderwritingData(
  form,
  flattenedData,
  fireDepartmentId,
  companyId,
  underwritingYear,
  formId,
  transaction,
  { Underwriting },
) {
  const vfbl = parseDecimal(flattenedData.vfbl_premium);
  const wc = parseDecimal(flattenedData.wc_premium);
  const totalPremium = vfbl !== null && wc !== null ? vfbl + wc : null;

  const parsedFormId =
    formId != null ? parseInt(formId, 10) : form?.id != null ? parseInt(form.id, 10) : null;

  const [underwriting] = await Underwriting.upsert(
    {
      fire_department_id: fireDepartmentId,
      company_id: companyId,
      underwriting_year: underwritingYear,
      form_id: Number.isFinite(parsedFormId) ? parsedFormId : null,
      vfbl,
      wc,
      total_premium: totalPremium,
    },
    {
      transaction,
      conflictFields: ["fire_department_id", "underwriting_year"],
      updateOnDuplicate: ["company_id", "form_id", "vfbl", "wc", "total_premium"],
    },
  );

  return underwriting;
}

// ─── fire_department_profile ───

async function extractProfileData(
  form,
  flattenedData,
  fireDepartmentId,
  companyId,
  effectiveDate,
  updatedBy,
  transaction,
  { FireDepartmentProfile },
) {
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
    { transaction },
  );
}

// ─── main entry: call from mark-submitted ───

async function extractFormData(formId, updatedBy, models) {
  const { FormData, FireDepartment, FireDepartmentProfile, Underwriting, sequelize } =
    models;

  const transaction = await sequelize.transaction();

  try {
    const form = await FormData.findByPk(formId, { transaction });
    if (!form) {
      throw new Error(`Form with id ${formId} not found`);
    }

    let fireDepartmentId = form.fire_department_id;

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
        { where: { id: formId }, transaction },
      );
    }

    if (!fireDepartmentId) {
      throw new Error("Cannot determine fire_department_id for form");
    }

    const flattenedData = flattenFormData(form.data);
    const effectiveDate = flattenedData.effective_date;
    const underwritingYear = extractPolicyYear(effectiveDate);

    if (!underwritingYear) {
      throw new Error("Cannot extract policy year from effective_date");
    }

    await FormData.update({ year: underwritingYear }, { where: { id: formId }, transaction });

    await extractUnderwritingData(
      form,
      flattenedData,
      fireDepartmentId,
      form.company_id,
      underwritingYear,
      formId,
      transaction,
      { Underwriting },
    );

    await extractProfileData(
      form,
      flattenedData,
      fireDepartmentId,
      form.company_id,
      effectiveDate,
      updatedBy,
      transaction,
      { FireDepartmentProfile },
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

// ─── optional: duplicate Submitted guard (mirror carrier mark-submitted) ───

async function assertNoDuplicateSubmitted(form, formId, policyYear, { FormData, Op }) {
  const duplicateWhere = {
    company_id: form.company_id,
    year: policyYear,
    application_status: "Submitted",
    id: { [Op.ne]: formId },
  };

  if (form.fire_department_id) {
    duplicateWhere.fire_department_id = form.fire_department_id;
  } else if (form.fire_department) {
    duplicateWhere.fire_department = form.fire_department;
  } else {
    throw new Error("Fire department must be set before Submitted");
  }

  const duplicate = await FormData.findOne({ where: duplicateWhere });
  if (duplicate) {
    const err = new Error(
      "Another application is already Submitted for this fire department, company, and policy year.",
    );
    err.existing_form_id = duplicate.id;
    throw err;
  }
}

/**
 * Example broker mark-submitted handler:
 *
 * async markSubmitted(req, res) {
 *   const { id, data, updated_by } = req.body;
 *   const updatedBy = updated_by || "broker";
 *
 *   if (data !== undefined) {
 *     await FormData.update({ data, updated_by: updatedBy }, { where: { id } });
 *   }
 *
 *   const form = await FormData.findByPk(id);
 *   const flat = flattenFormData(form.data);
 *   const policyYear = form.year || extractPolicyYear(flat.effective_date);
 *   await assertNoDuplicateSubmitted(form, id, policyYear, { FormData, Op });
 *
 *   await extractFormData(id, updatedBy, { FormData, FireDepartment, FireDepartmentProfile, Underwriting, sequelize });
 *
 *   await FormData.update(
 *     { application_status: "Submitted", status: form.status || "Pending", year: policyYear },
 *     { where: { id } }
 *   );
 *
 *   // If iframe has carrierApiBase, also:
 *   // await fetch(`${carrierApiBase}/agentform/mark-submitted`, { method: "POST", body: JSON.stringify({ id, updated_by: updatedBy }) });
 *
 *   res.json({ message: "Submitted", data: { id, application_status: "Submitted", year: policyYear } });
 * }
 */

module.exports = {
  extractFormData,
  extractUnderwritingData,
  extractProfileData,
  extractPolicyYear,
  flattenFormData,
  assertNoDuplicateSubmitted,
  computeProfileDensity,
  computeProfileTotalCalls,
};
