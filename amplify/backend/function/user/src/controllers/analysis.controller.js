const {
  FireDepartment,
  FireDepartmentProfile,
  Underwriting,
  UnderwritingResults,
  Policy,
  Company,
  FormData,
  sequelize,
} = require("../models");
const { Op } = require("sequelize");
const calculationService = require("../services/calculation.service");
const {
  computeProfileDensity,
  computeProfileTotalCalls,
} = require("../services/profileDerivedFields");
const {
  fetchCountyPopulationFromCensus,
} = require("../services/censusPopulation.service");

/**
 * Analysis data model (subscribed company = fire_department_profile.company_id / underwriting.company_id):
 * - fire_department_profile: one row per (company_id, fire_department_id); updated on each approved form / manual edit.
 * - underwriting: one row per (company_id, fire_department_id, underwriting_year).
 * - underwriting_results: one row per (company_id, fire_department_id, underwriting_year).
 * - policies: one row per (company_id, fire_department_id, underwriting_year).
 * Calculate uses the selected renewal year plus five prior years for loss-ratio and claims-per-100k totals (worksheet 5-yr row).
 * Detail/list “current” display uses the latest underwriting_year on file for that company (results + policy for that year only).
 */

class AnalysisController {
  setupRoutes(app) {
    app.get("/analysis/list", (...args) => this.getAnalysisList(...args));
    app.get("/analysis/:fire_department_id", (...args) =>
      this.getAnalysisDetail(...args)
    );
    app.put("/analysis/:fire_department_id/profile", (...args) =>
      this.updateProfile(...args)
    );
    app.post("/analysis/:fire_department_id/calculate", (...args) =>
      this.calculateAnalysis(...args)
    );
    app.post("/analysis/:fire_department_id/verify-population", (...args) =>
      this.verifyPopulation(...args)
    );
  }

  /**
   * POST /analysis/:fire_department_id/verify-population?company_id=...
   * Cross-checks `fire_department_profile.population` against the US Census
   * Bureau ACS5 county population (variable B01003_001E) using the fire
   * department's state + county. Persists the value to
   * `fire_department_profile.population_verified` and returns it so the UI
   * can show it alongside the carrier-stored figure.
   *
   * Body: none. Query: company_id (required).
   * Responses:
   *   200 -> { data: { population_verified, source, name, year } } on success
   *   200 -> { data: { population_verified: null }, message: "..." } when the
   *          FD is non-US / county can't be matched (not treated as error so
   *          the UI can just say "no match")
   *   400 -> missing company_id / FD state-county
   *   404 -> FD or profile missing
   */
  async verifyPopulation(req, res) {
    try {
      const { fire_department_id } = req.params;
      const { company_id: companyIdQuery } = req.query;

      if (!companyIdQuery) {
        return res.status(400).json({
          message: "company_id query parameter is required",
        });
      }
      const companyIdInt = parseInt(companyIdQuery, 10);
      if (!Number.isFinite(companyIdInt)) {
        return res.status(400).json({ message: "company_id must be a valid integer" });
      }

      const fd = await FireDepartment.findByPk(parseInt(fire_department_id, 10));
      if (!fd) {
        return res.status(404).json({ message: "Fire department not found" });
      }

      const profile = await FireDepartmentProfile.findOne({
        where: {
          fire_department_id: parseInt(fire_department_id, 10),
          company_id: companyIdInt,
        },
      });
      if (!profile) {
        return res.status(404).json({
          message: "Fire department profile not found for this company",
        });
      }

      const state = fd.state;
      const county = fd.county;
      if (!state || !county) {
        return res.status(400).json({
          message:
            "Fire department is missing state or county; cannot verify population from Census API",
        });
      }

      const census = await fetchCountyPopulationFromCensus({ state, county });
      if (!census) {
        // Not an error — just no match (e.g., Canadian county) — clear any stale value.
        await profile.update({ population_verified: null });
        return res.status(200).json({
          message:
            "No matching US county found in Census ACS5 for this state/county. Verification skipped.",
          data: {
            population_verified: null,
            source: null,
            name: null,
            year: null,
          },
        });
      }

      await profile.update({ population_verified: census.population });

      return res.status(200).json({
        message: "Population verified from US Census Bureau",
        data: {
          population_verified: census.population,
          source: census.source,
          name: census.name,
          year: census.year,
        },
      });
    } catch (error) {
      console.error("Error verifying population:", error);
      // Census key not configured / invalid → 503 with the actionable message
      // so the carrier UI can show it verbatim and the admin knows exactly
      // what to fix. Other errors stay as 500.
      if (error && error.keyError) {
        return res.status(503).json({
          code: "CENSUS_API_KEY_REQUIRED",
          message: error.message,
        });
      }
      return res.status(500).json({
        message: "Error verifying population",
        error: error.message,
      });
    }
  }

  /**
   * PUT /analysis/:fire_department_id/profile?company_id=...
   * Update current fire department profile for that subscribed company (matches fire_department_profile.company_id)
   * Body: { population?, square_miles?, fire_calls?, ems_calls?, safety_committee?, hs_officers?, motorized_racing_team?, motorized_racing_team_count?, management_practice_penalty?, customer_since?, agent? } — density and total_calls are recomputed server-side.
   */
  async updateProfile(req, res) {
    try {
      const { fire_department_id } = req.params;
      const { company_id: companyIdQuery } = req.query;
      const body = req.body;

      if (!companyIdQuery) {
        return res.status(400).json({
          message: "company_id query parameter is required",
        });
      }
      const companyIdInt = parseInt(companyIdQuery);

      const profile = await FireDepartmentProfile.findOne({
        where: {
          fire_department_id: parseInt(fire_department_id),
          company_id: companyIdInt,
        },
      });

      const updateData = {};
      if (body.population !== undefined) updateData.population = body.population;
      if (body.square_miles !== undefined) updateData.square_miles = body.square_miles;
      if (body.fire_calls !== undefined) updateData.fire_calls = body.fire_calls;
      if (body.ems_calls !== undefined) updateData.ems_calls = body.ems_calls;
      if (body.safety_committee !== undefined) {
        updateData.safety_committee =
          body.safety_committee === null ? null : !!body.safety_committee;
      }
      if (body.hs_officers !== undefined) updateData.hs_officers = body.hs_officers;
      if (body.motorized_racing_team_count !== undefined) {
        updateData.motorized_racing_team_count = body.motorized_racing_team_count;
        const cnt = body.motorized_racing_team_count;
        if (cnt != null && Number(cnt) > 0) updateData.motorized_racing_team = true;
        else if (cnt === 0) updateData.motorized_racing_team = false;
      }
      if (
        body.motorized_racing_team !== undefined &&
        body.motorized_racing_team_count === undefined
      ) {
        updateData.motorized_racing_team = !!body.motorized_racing_team;
      }
      if (body.management_practice_penalty !== undefined) {
        updateData.management_practice_penalty = body.management_practice_penalty;
      }
      if (body.customer_since !== undefined) updateData.customer_since = body.customer_since;
      if (body.agent !== undefined) updateData.agent = body.agent;

      const mergeForDerived = (base) => ({
        population:
          updateData.population !== undefined ? updateData.population : base.population,
        square_miles:
          updateData.square_miles !== undefined ? updateData.square_miles : base.square_miles,
        fire_calls:
          updateData.fire_calls !== undefined ? updateData.fire_calls : base.fire_calls,
        ems_calls:
          updateData.ems_calls !== undefined ? updateData.ems_calls : base.ems_calls,
      });

      if (profile) {
        const m = mergeForDerived(profile.get({ plain: true }));
        updateData.density = computeProfileDensity(m.population, m.square_miles);
        updateData.total_calls = computeProfileTotalCalls(m.fire_calls, m.ems_calls);
        await profile.update(updateData);
        return res.status(200).json({
          message: "Profile updated successfully",
          data: profile,
        });
      }

      const fd = await FireDepartment.findByPk(parseInt(fire_department_id));
      if (!fd) {
        return res.status(404).json({ message: "Fire department not found" });
      }

      let motorizedRacingTeam = body.motorized_racing_team ?? null;
      let motorizedRacingTeamCount = body.motorized_racing_team_count ?? null;
      if (body.motorized_racing_team_count !== undefined) {
        motorizedRacingTeamCount = body.motorized_racing_team_count;
        const cnt = body.motorized_racing_team_count;
        if (cnt != null && Number(cnt) > 0) motorizedRacingTeam = true;
        else if (cnt === 0) motorizedRacingTeam = false;
      }

      const pop = body.population ?? null;
      const sq = body.square_miles ?? null;
      const fc = body.fire_calls ?? null;
      const ec = body.ems_calls ?? null;

      const newProfile = await FireDepartmentProfile.create({
        fire_department_id: parseInt(fire_department_id),
        company_id: companyIdInt,
        population: pop,
        square_miles: sq,
        fire_calls: fc,
        ems_calls: ec,
        density: computeProfileDensity(pop, sq),
        total_calls: computeProfileTotalCalls(fc, ec),
        safety_committee: body.safety_committee ?? null,
        hs_officers: body.hs_officers ?? null,
        motorized_racing_team: motorizedRacingTeam,
        motorized_racing_team_count: motorizedRacingTeamCount,
        management_practice_penalty: body.management_practice_penalty ?? null,
        customer_since: body.customer_since ?? null,
        agent: body.agent ?? null,
        effective_from: new Date().toISOString().slice(0, 10),
        effective_to: null,
      });

      return res.status(200).json({
        message: "Profile created successfully",
        data: newProfile,
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      return res.status(500).json({
        message: "Error updating profile",
        error: error.message,
      });
    }
  }

  /**
   * GET /analysis/list?company_id=...
   * Lightweight: only fire departments linked to this company via fire_department_profile.
   * Profile, underwriting, results, policies load on GET /analysis/:fire_department_id?company_id= (View).
   */
  async getAnalysisList(req, res) {
    try {
      const { company_id } = req.query;

      if (!company_id) {
        return res.status(400).json({
          message: "company_id query parameter is required",
        });
      }

      const companyIdInt = parseInt(company_id);

      const profiles = await FireDepartmentProfile.findAll({
        where: { company_id: companyIdInt },
        attributes: ["fire_department_id"],
      });
      const fireDepartmentIds = [...new Set(profiles.map((p) => p.fire_department_id).filter((id) => id != null))];

      if (fireDepartmentIds.length === 0) {
        return res.status(200).json({
          message: "Analysis list retrieved successfully",
          data: [],
        });
      }

      const fireDepartments = await FireDepartment.findAll({
        where: { fire_department_id: { [Op.in]: fireDepartmentIds } },
        attributes: [
          "fire_department_id",
          "fire_department_name",
          "county",
          "state",
        ],
        order: [["fire_department_name", "ASC"]],
      });

      const listCompany = await Company.findByPk(companyIdInt, {
        attributes: ["id", "Company_Name"],
      });

      const data = fireDepartments.map((fd) => ({
        fire_department_id: fd.fire_department_id,
        fire_department_name: fd.fire_department_name,
        county: fd.county,
        state: fd.state,
        company_id: companyIdInt,
        company: listCompany,
      }));

      res.status(200).json({
        message: "Analysis list retrieved successfully",
        data,
      });
    } catch (error) {
      console.error("Error retrieving analysis list:", error);
      res.status(500).json({
        message: "Error retrieving analysis list",
        error: error.message,
      });
    }
  }

  /**
   * GET /analysis/:fire_department_id?company_id=...
   * Scoped to one subscribed company: underwriting and profile match fire_department_profile.company_id.
   * "Latest year" = most recent underwriting_year for that company (not calendar); may differ if new year not entered yet.
   */
  async getAnalysisDetail(req, res) {
    try {
      const { fire_department_id } = req.params;
      const { company_id: companyIdQuery } = req.query;

      if (!companyIdQuery) {
        return res.status(400).json({
          message: "company_id query parameter is required",
        });
      }
      const companyIdInt = parseInt(companyIdQuery);

      // Get fire department
      const fireDepartment = await FireDepartment.findByPk(
        parseInt(fire_department_id),
        {
          include: [
            {
              model: Company,
              as: "company",
              attributes: ["id", "Company_Name"],
              required: false,
            },
          ],
        }
      );

      if (!fireDepartment) {
        return res.status(404).json({
          message: "Fire department not found",
        });
      }

      const currentProfile = await FireDepartmentProfile.findOne({
        where: {
          fire_department_id: parseInt(fire_department_id),
          company_id: companyIdInt,
        },
      });

      // Enough years to show renewal row + history used for 5-yr totals (and older rows for context)
      const underwritingRows = await Underwriting.findAll({
        where: {
          fire_department_id: parseInt(fire_department_id),
          company_id: companyIdInt,
        },
        include: [
          {
            model: Company,
            as: "company",
            attributes: ["id", "Company_Name"],
            required: false,
          },
        ],
        order: [["underwriting_year", "DESC"]],
        limit: 24,
      });

      // Latest year on file for this company (not "calendar current" — add a row for the new year when ready)
      const latestUnderwritingYearForCompany =
        underwritingRows[0]?.underwriting_year ?? null;

      let results = [];
      if (latestUnderwritingYearForCompany) {
        const resultsWhere = {
          fire_department_id: parseInt(fire_department_id),
          underwriting_year: latestUnderwritingYearForCompany,
          company_id: companyIdInt,
        };
        results = await UnderwritingResults.findAll({
          where: resultsWhere,
          include: [
            {
              model: Company,
              as: "assignedCompany",
              attributes: ["id", "Company_Name"],
              required: false,
            },
            {
              model: Company,
              as: "company",
              attributes: ["id", "Company_Name"],
              required: false,
            },
          ],
          order: [["underwriting_year", "DESC"]],
        });
      }

      // Same “current display year” as results: policy for (fd, company, latest_underwriting_year only)
      let policies = [];
      if (latestUnderwritingYearForCompany) {
        const policyForCurrentYear = await Policy.findOne({
          where: {
            fire_department_id: parseInt(fire_department_id),
            company_id: companyIdInt,
            underwriting_year: latestUnderwritingYearForCompany,
          },
          include: [
            {
              model: Company,
              as: "assignedCompany",
              attributes: ["id", "Company_Name"],
              required: false,
            },
            {
              model: Company,
              as: "company",
              attributes: ["id", "Company_Name"],
              required: false,
            },
          ],
        });
        if (policyForCurrentYear) {
          policies = [policyForCurrentYear];
        }
      }

      // Get related forms
      const forms = await FormData.findAll({
        where: { fire_department: fireDepartment.fire_department_name },
        order: [["created_at", "DESC"]],
        limit: 5,
      });

      res.status(200).json({
        message: "Analysis detail retrieved successfully",
        data: {
          fire_department: fireDepartment,
          analysis_company_id: companyIdInt,
          /** Most recent underwriting_year for this company; not necessarily "today's" policy year until a row exists */
          latest_underwriting_year: latestUnderwritingYearForCompany,
          profile: currentProfile,
          underwriting: underwritingRows,
          results: results,
          policies: policies,
          forms: forms,
        },
      });
    } catch (error) {
      console.error("Error retrieving analysis detail:", error);
      res.status(500).json({
        message: "Error retrieving analysis detail",
        error: error.message,
      });
    }
  }

  /**
   * POST /analysis/:fire_department_id/calculate
   * Calculate analysis for a specific underwriting year and subscribed company
   * Body: { underwriting_year, company_id }
   * Runs calculation, writes underwriting_results, updates underwriting + policies
   */
  async calculateAnalysis(req, res) {
    // Do not open a DB transaction until validations pass — early returns used to leave
    // transactions open and could exhaust the pool (502 from API Gateway / Lambda).
    let transaction = null;
    try {
      const { fire_department_id } = req.params;
      const { underwriting_year, company_id: companyIdBody } = req.body;

      if (!underwriting_year) {
        return res.status(400).json({
          message: "underwriting_year is required in request body",
        });
      }
      if (companyIdBody === undefined || companyIdBody === null || companyIdBody === "") {
        return res.status(400).json({
          message: "company_id is required in request body",
        });
      }
      const companyIdInt = parseInt(companyIdBody);
      if (Number.isNaN(companyIdInt)) {
        return res.status(400).json({ message: "company_id must be a valid integer" });
      }

      // Get fire department (read-only, no transaction yet)
      const fireDepartment = await FireDepartment.findByPk(
        parseInt(fire_department_id)
      );

      if (!fireDepartment) {
        return res.status(404).json({
          message: "Fire department not found",
        });
      }

      const profile = await FireDepartmentProfile.findOne({
        where: {
          fire_department_id: parseInt(fire_department_id),
          company_id: companyIdInt,
        },
      });

      // Enough history for: selected renewal year + five prior years (worksheet 5-yr totals)
      const underwritingRows = await Underwriting.findAll({
        where: {
          fire_department_id: parseInt(fire_department_id),
          company_id: companyIdInt,
        },
        order: [["underwriting_year", "DESC"]],
        limit: 24,
      });

      const targetRow = underwritingRows.find(
        (row) => row.underwriting_year === underwriting_year
      );
      if (!targetRow) {
        return res.status(400).json({
          code: "MISSING_5_YEAR_DATA",
          message:
            "Cannot run analysis: the selected underwriting year was not found for this company. Save underwriting data first.",
        });
      }

      const priorFive = calculationService.getPriorFiveYearRows(
        underwritingRows,
        underwriting_year
      );
      if (!priorFive || priorFive.length < 5) {
        return res.status(400).json({
          code: "MISSING_5_YEAR_DATA",
          message:
            "Cannot run analysis: five complete underwriting years immediately before the selected year are required (same as the worksheet 5-year totals row). Add older years or choose a different year.",
        });
      }
      const priorFiveMissingCategory = priorFive
        .filter((row) => String(row.type ?? row.category ?? "").trim() === "")
        .map((row) => row.underwriting_year);
      if (priorFiveMissingCategory.length > 0) {
        return res.status(400).json({
          code: "MISSING_5_YEAR_DATA",
          message: `Cannot run analysis: category (FDM / FDI / FPI) is required on each of the five years before the selected year. Missing category for: ${priorFiveMissingCategory.join(", ")}.`,
        });
      }

      const rowCompanyId =
        targetRow.company_id != null ? parseInt(targetRow.company_id, 10) : null;
      if (rowCompanyId !== companyIdInt) {
        return res.status(400).json({
          message:
            "Underwriting row company_id does not match request company_id. Ensure each row is saved with the correct company.",
        });
      }

      // Note: the renewal/target row is not part of the 5-year aggregates that
      // produce points (see calculation.service.js getPriorFiveYearRows), so we
      // intentionally do NOT require premium/losses/LAE on it. It only needs
      // to exist so we have a year key to write underwriting_results / policy
      // and to update underwriting.category after calculation.

      if (!profile) {
        return res.status(400).json({
          code: "MISSING_PROFILE",
          message:
            "Fire department profile is missing. Please complete the profile (e.g. from approved application forms).",
        });
      }

      const requiredProfileFields = [
        "population",
        "square_miles",
        "fire_calls",
        "ems_calls",
        "safety_committee",
        "hs_officers",
        "motorized_racing_team",
      ];
      const missingFields = requiredProfileFields.filter((field) => {
        if (field === "safety_committee") {
          return profile.safety_committee !== true && profile.safety_committee !== false;
        }
        if (field === "hs_officers") {
          const v = profile.hs_officers;
          if (v === undefined || v === null || v === "") return true;
          if (typeof v === "number") return Number.isNaN(v);
          if (typeof v === "string") return v.trim() === "" || Number.isNaN(Number(v));
          return Number.isNaN(Number(v));
        }
        const value = profile[field];
        if (value === undefined || value === null) return true;
        if (typeof value === "boolean") return false;
        if (typeof value === "number") return isNaN(value);
        if (typeof value === "string") return value.trim() === "";
        return false;
      });
      if (missingFields.length > 0) {
        return res.status(400).json({
          code: "MISSING_PROFILE",
          message: `Fire department profile is incomplete. Missing: ${missingFields.join(", ")}. Please complete the profile (e.g. from approved application forms).`,
        });
      }

      transaction = await sequelize.transaction();

      const resultsCompanyId = companyIdInt;

      const resultsWhere = {
        fire_department_id: parseInt(fire_department_id),
        underwriting_year: underwriting_year,
        company_id: resultsCompanyId,
      };

      // Run calculation
      const calculationResult = await calculationService.calculate(
        fireDepartment,
        profile,
        underwritingRows,
        underwriting_year,
        transaction
      );

      const { assigned_category, ...calcRest } = calculationResult;
      const resultFields = {
        ...calcRest,
        company_id: resultsCompanyId,
        category: assigned_category,
      };

      // Upsert underwriting_results — one row per fire_department_id + year + company_id
      const [result, created] = await UnderwritingResults.findOrCreate({
        where: resultsWhere,
        defaults: {
          fire_department_id: parseInt(fire_department_id),
          underwriting_year: underwriting_year,
          ...resultFields,
        },
        transaction,
      });

      if (!created) {
        await result.update(resultFields, { transaction });
      }

      // Update underwriting row with assigned category only. Do not store total analysis points on yearly
      // rows (worksheet leaves per-year POINTS blank; loss-ratio points live on the 5-yr totals via results).
      const targetUnderwriting = await Underwriting.findOne({
        where: {
          fire_department_id: parseInt(fire_department_id),
          underwriting_year: underwriting_year,
          company_id: resultsCompanyId,
        },
        transaction,
      });

      if (targetUnderwriting) {
        await targetUnderwriting.update(
          {
            points: null,
            // Store assigned category (FDM/FDI/FPI) in underwriting.category (model field: type)
            type: calculationResult.assigned_category,
          },
          { transaction }
        );
      }

      const policyWhere = {
        fire_department_id: parseInt(fire_department_id),
        underwriting_year: underwriting_year,
        company_id: companyIdInt,
      };
      const [policy, policyCreated] = await Policy.findOrCreate({
        where: policyWhere,
        defaults: {
          fire_department_id: parseInt(fire_department_id),
          underwriting_year: underwriting_year,
          company_id: companyIdInt,
          assigned_company_id: calculationResult.assigned_company_id,
        },
        transaction,
      });

      if (!policyCreated) {
        await policy.update(
          {
            assigned_company_id: calculationResult.assigned_company_id,
            company_id: companyIdInt,
          },
          { transaction }
        );
      }

      await transaction.commit();

      res.status(200).json({
        message: "Analysis calculated successfully",
        data: {
          result: result,
          underwriting: targetUnderwriting,
          policy: policy,
        },
      });
    } catch (error) {
      if (transaction && !transaction.finished) {
        try {
          await transaction.rollback();
        } catch (rollbackErr) {
          console.error("Rollback after calculateAnalysis error:", rollbackErr);
        }
      }
      console.error("Error calculating analysis:", error);
      res.status(500).json({
        message: "Error calculating analysis",
        error: error.message,
      });
    }
  }
}

module.exports = new AnalysisController();



