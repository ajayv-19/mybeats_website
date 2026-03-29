const {
  LookupLossRatioPoints,
  LookupDensityPoints,
  LookupCallVolumePoints,
  LookupFrequencyPoints,
  Company,
  sequelize,
} = require("../models");
const { Op } = require("sequelize");

function rowPremium(row) {
  const tp = Number(row.total_premium);
  if (Number.isFinite(tp) && tp > 0) return tp;
  return (Number(row.vfbl) || 0) + (Number(row.wc) || 0);
}

function rowLossLae(row) {
  const t = row.total_loss_lae;
  if (t != null && t !== "" && Number.isFinite(Number(t))) return Number(t);
  return (Number(row.losses) || 0) + (Number(row.lae) || 0);
}

class CalculationService {
  /**
   * Five underwriting periods immediately before `underwritingYear` (worksheet “5 Yr Totals” row).
   * Rows must be sorted ascending by `underwriting_year` for a contiguous window.
   */
  getPriorFiveYearRows(underwritingRows, underwritingYear) {
    const asc = [...underwritingRows].sort((a, b) =>
      String(a.underwriting_year).localeCompare(String(b.underwriting_year))
    );
    const idx = asc.findIndex((r) => r.underwriting_year === underwritingYear);
    if (idx < 5) return null;
    return asc.slice(idx - 5, idx);
  }

  /**
   * Calculate analysis for a fire department
   * @param {FireDepartment} fireDepartment
   * @param {FireDepartmentProfile} profile
   * @param {Array<Underwriting>} underwritingRows — include enough history so five years exist before the target year
   * @param {string} underwritingYear - Target year to calculate (renewal row; not included in loss-ratio / frequency aggregates)
   * @param {Transaction} transaction
   * @returns {Promise<Object>} Calculation result with points breakdown
   */
  async calculate(
    fireDepartment,
    profile,
    underwritingRows,
    underwritingYear,
    transaction
  ) {
    // Get the target year's underwriting row (renewal / current period on the worksheet)
    const targetRow = underwritingRows.find(
      (row) => row.underwriting_year === underwritingYear
    );

    if (!targetRow) {
      throw new Error(
        `Underwriting row not found for year ${underwritingYear}`
      );
    }

    const priorFive = this.getPriorFiveYearRows(
      underwritingRows,
      underwritingYear
    );
    if (!priorFive || priorFive.length < 5) {
      throw new Error(
        "Five underwriting years immediately before the selected year are required (worksheet 5-year totals)."
      );
    }

    let aggPremium = 0;
    let aggLossLae = 0;
    let aggClaims = 0;
    for (const row of priorFive) {
      aggPremium += rowPremium(row);
      aggLossLae += rowLossLae(row);
      aggClaims += Number(row.number_of_claims) || 0;
    }

    const lossRatio =
      aggPremium > 0 ? (aggLossLae / aggPremium) * 100 : 0;
    const claimsPer100k =
      aggPremium > 0 ? (aggClaims / aggPremium) * 100000 : 0;

    // Calculate from profile
    const population = profile?.population || 0;
    const squareMiles = profile?.square_miles
      ? parseFloat(profile.square_miles)
      : 0;
    const densityStored =
      profile?.density != null && profile?.density !== ""
        ? parseFloat(profile.density)
        : NaN;
    const density =
      Number.isFinite(densityStored) && densityStored >= 0
        ? densityStored
        : squareMiles > 0
        ? Math.round(population / squareMiles)
        : 0;
    const fireCalls = profile?.fire_calls || 0;
    const emsCalls = profile?.ems_calls || 0;
    const totalCallsStored =
      profile?.total_calls != null && profile?.total_calls !== ""
        ? parseInt(profile.total_calls, 10)
        : NaN;
    const totalCalls = Number.isFinite(totalCallsStored)
      ? totalCallsStored
      : fireCalls + emsCalls;

    // Lookup points — must use the same Sequelize transaction: pool.max is 1, so queries
    // without `transaction` deadlock waiting for a second connection while the txn holds the only one.
    const lossRatioPoints = await this.lookupLossRatioPoints(lossRatio, transaction);
    const densityPoints = await this.lookupDensityPoints(density, transaction);
    const callVolumePoints = await this.lookupCallVolumePoints(totalCalls, transaction);
    const frequencyPoints = await this.lookupFrequencyPoints(claimsPer100k, transaction);

    // Profile rows (worksheet): motorized present → −2, else 0; H&S present → +1, else −2; safety → +1 / −2
    const rcNum =
      profile?.motorized_racing_team_count != null &&
      profile?.motorized_racing_team_count !== ""
        ? Number(profile.motorized_racing_team_count)
        : 0;
    const racingPresent =
      profile?.motorized_racing_team === true ||
      (Number.isFinite(rcNum) && rcNum > 0);
    const racingPenalty = racingPresent ? -2 : 0;

    if (profile?.safety_committee !== true && profile?.safety_committee !== false) {
      throw new Error(
        "Profile field safety_committee must be set to yes or no before calculating."
      );
    }
    const safetyPoints = profile.safety_committee === true ? 1 : -2;

    const hsoRaw = profile?.hs_officers;
    if (hsoRaw === null || hsoRaw === undefined || hsoRaw === "") {
      throw new Error(
        "Profile field hs_officers must be set (use 0 if none) before calculating."
      );
    }
    const hso = Number(hsoRaw);
    if (!Number.isFinite(hso) || hso < 0) {
      throw new Error("Profile hs_officers must be a non-negative number.");
    }
    const hsoPoints = hso > 0 ? 1 : -2;

    const mpRaw = profile?.management_practice_penalty;
    const mpParsed =
      mpRaw != null && mpRaw !== "" ? Number(mpRaw) : 0;
    const managementPracticePenalty = Number.isFinite(mpParsed)
      ? Math.trunc(mpParsed)
      : 0;

    let adjustments = managementPracticePenalty;

    // Calculate total points
    const totalPoints =
      lossRatioPoints +
      densityPoints +
      callVolumePoints +
      frequencyPoints +
      safetyPoints +
      hsoPoints +
      racingPenalty +
      adjustments;

    // If total exceeds 31, subtract the excess from adjustments to bring it to exactly 31
    let finalTotalPoints = totalPoints;
    if (totalPoints > 31) {
      const excess = totalPoints - 31;
      finalTotalPoints = 31;
      // Adjust the adjustments field to reflect the reduction
      // This way the breakdown still shows original calculation
      adjustments = adjustments - excess;
    }

    // Determine assigned company and category based on final total points
    // 0-14 → FDM, 15-25 → FDI, 26-31 → FPI
    const assignedCompanyId = await this.getAssignedCompanyId(
      finalTotalPoints,
      fireDepartment.company_id,
      transaction
    );
    let assignedCategory = "FDM";
    if (finalTotalPoints >= 26 && finalTotalPoints <= 31) {
      assignedCategory = "FPI";
    } else if (finalTotalPoints >= 15 && finalTotalPoints <= 25) {
      assignedCategory = "FDI";
    }

    return {
      loss_ratio_points: lossRatioPoints,
      density_points: densityPoints,
      call_volume_points: callVolumePoints,
      frequency_factor_points: frequencyPoints,
      safety_points: safetyPoints,
      hso_points: hsoPoints,
      racing_penalty: racingPenalty,
      management_practice_penalty: managementPracticePenalty,
      adjustments: adjustments, // management penalty ± cap normalization if total exceeded 31
      total_points: finalTotalPoints, // Never exceeds 31
      assigned_company_id: assignedCompanyId,
      assigned_category: assignedCategory, // FDM | FDI | FPI — store in underwriting.category
    };
  }

  /**
   * Lookup loss ratio points
   * 0.00-10.00 => 22, 11.00-20.00 => 20, etc.
   */
  async lookupLossRatioPoints(lossRatio, transaction) {
    const lookup = await LookupLossRatioPoints.findOne({
      where: {
        min_value: { [Op.lte]: lossRatio },
        max_value: { [Op.gte]: lossRatio },
      },
      order: [["min_value", "ASC"]],
      transaction,
    });

    return lookup ? lookup.points : 0;
  }

  /**
   * Lookup density points
   * 0-500 => 4, 501-1500 => 3, etc.
   */
  async lookupDensityPoints(density, transaction) {
    const lookup = await LookupDensityPoints.findOne({
      where: {
        min_value: { [Op.lte]: density },
        max_value: { [Op.gte]: density },
      },
      order: [["min_value", "ASC"]],
      transaction,
    });

    return lookup ? lookup.points : 0;
  }

  /**
   * Lookup call volume points
   * 0-250 => 5, 251-500 => 4, etc.
   */
  async lookupCallVolumePoints(totalCalls, transaction) {
    const lookup = await LookupCallVolumePoints.findOne({
      where: {
        min_value: { [Op.lte]: totalCalls },
        max_value: { [Op.gte]: totalCalls },
      },
      order: [["min_value", "ASC"]],
      transaction,
    });

    return lookup ? lookup.points : 0;
  }

  /**
   * Lookup frequency points (claims per 100k)
   * 0.00-0.75 => 5, 0.76-1.50 => 4, etc. (can be negative)
   */
  async lookupFrequencyPoints(claimsPer100k, transaction) {
    const lookup = await LookupFrequencyPoints.findOne({
      where: {
        min_value: { [Op.lte]: claimsPer100k },
        max_value: { [Op.gte]: claimsPer100k },
      },
      order: [["min_value", "ASC"]],
      transaction,
    });

    return lookup ? lookup.points : 0;
  }

  /**
   * Get assigned company ID based on total points
   * 0-14 => FDM, 15-25 => FDI, 26-31 => FPI
   * Points should never exceed 31 (handled in calculate method)
   * Returns company_id from Subscribed_Companies where Company_Name matches
   */
  async getAssignedCompanyId(totalPoints, defaultCompanyId, transaction) {
    let companyName;
    if (totalPoints >= 0 && totalPoints <= 14) {
      companyName = "FDM";
    } else if (totalPoints >= 15 && totalPoints <= 25) {
      companyName = "FDI";
    } else if (totalPoints >= 26 && totalPoints <= 31) {
      companyName = "FPI";
    } else {
      // Default to FDM for edge cases (shouldn't happen if points are properly adjusted)
      companyName = "FDM";
    }

    // Find company by name
    const company = await Company.findOne({
      where: {
        Company_Name: companyName,
      },
      transaction,
    });

    return company ? company.id : defaultCompanyId;
  }

  /**
   * Initialize lookup tables with default values
   * This should be run once to populate the tables
   */
  async initializeLookupTables() {
    // Loss Ratio Points
    const lossRatioRanges = [
      [0.0, 10.0, 22],
      [11.0, 20.0, 20],
      [21.0, 30.0, 18],
      [31.0, 40.0, 16],
      [41.0, 50.0, 14],
      [51.0, 60.0, 12],
      [61.0, 70.0, 10],
      [71.0, 80.0, 8],
      [81.0, 90.0, 6],
      [91.0, 100.0, 4],
      [101.0, 1000.0, 0],
    ];

    for (const [min, max, points] of lossRatioRanges) {
      await LookupLossRatioPoints.findOrCreate({
        where: { min_value: min, max_value: max },
        defaults: { min_value: min, max_value: max, points },
      });
    }

    // Density Points
    const densityRanges = [
      [0, 500, 4],
      [501, 1500, 3],
      [1501, 3000, 2],
      [3001, 5000, 1],
      [5001, 15000, 0],
    ];

    for (const [min, max, points] of densityRanges) {
      await LookupDensityPoints.findOrCreate({
        where: { min_value: min, max_value: max },
        defaults: { min_value: min, max_value: max, points },
      });
    }

    // Call Volume Points
    const callVolumeRanges = [
      [0, 250, 5],
      [251, 500, 4],
      [501, 1000, 3],
      [1001, 1500, 2],
      [1501, 2000, 1],
      [2001, 10000, 0],
    ];

    for (const [min, max, points] of callVolumeRanges) {
      await LookupCallVolumePoints.findOrCreate({
        where: { min_value: min, max_value: max },
        defaults: { min_value: min, max_value: max, points },
      });
    }

    // Frequency Points
    const frequencyRanges = [
      [0.0, 0.75, 5],
      [0.76, 1.5, 4],
      [1.51, 2.25, 3],
      [2.26, 3.0, 2],
      [3.01, 3.75, 1],
      [3.76, 4.5, 0],
      [4.51, 5.25, -1],
      [5.26, 6.0, -2],
      [6.01, 6.75, -3],
      [6.76, 7.5, -4],
      [7.51, 8.25, -5],
      [8.26, 9.0, -6],
      [9.01, 9.75, -7],
      [9.76, 10.5, -8],
      [10.51, 11.25, -9],
      [11.26, 9999.99, -10],
    ];

    for (const [min, max, points] of frequencyRanges) {
      await LookupFrequencyPoints.findOrCreate({
        where: { min_value: min, max_value: max },
        defaults: { min_value: min, max_value: max, points },
      });
    }
  }
}

module.exports = new CalculationService();

