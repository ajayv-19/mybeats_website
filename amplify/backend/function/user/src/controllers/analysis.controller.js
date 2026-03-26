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
  }

  /**
   * PUT /analysis/:fire_department_id/profile
   * Update current fire department profile (for manual entry from analysis page)
   * Body: { population?, square_miles?, fire_calls?, ems_calls?, safety_committee?, hs_officers?, motorized_racing_team?, company_id? }
   */
  async updateProfile(req, res) {
    try {
      const { fire_department_id } = req.params;
      const body = req.body;

      const profile = await FireDepartmentProfile.findOne({
        where: {
          fire_department_id: parseInt(fire_department_id),
          [Op.or]: [
            { effective_to: null },
            { effective_to: { [Op.gte]: new Date() } },
          ],
        },
        order: [["effective_from", "DESC"]],
      });

      const updateData = {};
      if (body.population !== undefined) updateData.population = body.population;
      if (body.square_miles !== undefined) updateData.square_miles = body.square_miles;
      if (body.fire_calls !== undefined) updateData.fire_calls = body.fire_calls;
      if (body.ems_calls !== undefined) updateData.ems_calls = body.ems_calls;
      if (body.safety_committee !== undefined) updateData.safety_committee = !!body.safety_committee;
      if (body.hs_officers !== undefined) updateData.hs_officers = body.hs_officers;
      if (body.motorized_racing_team !== undefined) updateData.motorized_racing_team = !!body.motorized_racing_team;
      if (body.company_id !== undefined) updateData.company_id = body.company_id;

      if (profile) {
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

      const newProfile = await FireDepartmentProfile.create({
        fire_department_id: parseInt(fire_department_id),
        company_id: body.company_id ?? fd.company_id ?? null,
        population: body.population ?? null,
        square_miles: body.square_miles ?? null,
        fire_calls: body.fire_calls ?? null,
        ems_calls: body.ems_calls ?? null,
        safety_committee: body.safety_committee ?? null,
        hs_officers: body.hs_officers ?? null,
        motorized_racing_team: body.motorized_racing_team ?? null,
        effective_from: new Date().toISOString().slice(0, 10),
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
   * Get list of fire departments for analysis.
   * Only departments that have a fire_department_profile row with this company_id
   * (profile is created when a form is approved for the first time; excludes rejected/pending-only).
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

      // Get fire_department_ids from fire_department_profile where company_id matches
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
        include: [
          {
            model: Company,
            as: "company",
            attributes: ["id", "Company_Name"],
            required: false,
          },
        ],
        order: [["fire_department_name", "ASC"]],
      });

      // Get latest profile and latest underwriting year for each
      const enrichedList = await Promise.all(
        fireDepartments.map(async (fd) => {
          const latestProfile = await FireDepartmentProfile.findOne({
            where: {
              fire_department_id: fd.fire_department_id,
              [Op.or]: [
                { effective_to: null },
                { effective_to: { [Op.gte]: new Date() } },
              ],
            },
            order: [["effective_from", "DESC"]],
          });

          const latestUnderwriting = await Underwriting.findOne({
            where: {
              fire_department_id: fd.fire_department_id,
            },
            order: [["underwriting_year", "DESC"]],
          });

          const latestPolicy = await Policy.findOne({
            where: {
              fire_department_id: fd.fire_department_id,
            },
            order: [["underwriting_year", "DESC"]],
          });

          return {
            fire_department_id: fd.fire_department_id,
            fire_department_name: fd.fire_department_name,
            county: fd.county,
            state: fd.state,
            company_id: fd.company_id,
            company: fd.company,
            latest_profile: latestProfile,
            latest_underwriting_year: latestUnderwriting?.underwriting_year,
            latest_policy: latestPolicy,
          };
        })
      );

      res.status(200).json({
        message: "Analysis list retrieved successfully",
        data: enrichedList,
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
   * GET /analysis/:fire_department_id
   * Get detailed analysis for a fire department
   * Returns: underwriting rows, profile, results, policies, form status
   */
  async getAnalysisDetail(req, res) {
    try {
      const { fire_department_id } = req.params;

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

      // Get current profile
      const currentProfile = await FireDepartmentProfile.findOne({
        where: {
          fire_department_id: parseInt(fire_department_id),
          [Op.or]: [
            { effective_to: null },
            { effective_to: { [Op.gte]: new Date() } },
          ],
        },
        order: [["effective_from", "DESC"]],
      });

      // Get last 5 years of underwriting
      const underwritingRows = await Underwriting.findAll({
        where: {
          fire_department_id: parseInt(fire_department_id),
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
        limit: 5,
      });

      // Get all underwriting results
      const results = await UnderwritingResults.findAll({
        where: {
          fire_department_id: parseInt(fire_department_id),
        },
        include: [
          {
            model: Company,
            as: "assignedCompany",
            attributes: ["id", "Company_Name"],
            required: false,
          },
        ],
        order: [["underwriting_year", "DESC"]],
      });

      // Get all policies
      const policies = await Policy.findAll({
        where: {
          fire_department_id: parseInt(fire_department_id),
        },
        include: [
          {
            model: Company,
            as: "assignedCompany",
            attributes: ["id", "Company_Name"],
            required: false,
          },
        ],
        order: [["underwriting_year", "DESC"]],
      });

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
   * Calculate analysis for a specific underwriting year
   * Body: { underwriting_year }
   * Runs calculation, writes underwriting_results, updates underwriting + policies
   */
  async calculateAnalysis(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { fire_department_id } = req.params;
      const { underwriting_year } = req.body;

      if (!underwriting_year) {
        return res.status(400).json({
          message: "underwriting_year is required in request body",
        });
      }

      // Get fire department
      const fireDepartment = await FireDepartment.findByPk(
        parseInt(fire_department_id),
        { transaction }
      );

      if (!fireDepartment) {
        return res.status(404).json({
          message: "Fire department not found",
        });
      }

      // Get current profile
      const profile = await FireDepartmentProfile.findOne({
        where: {
          fire_department_id: parseInt(fire_department_id),
          [Op.or]: [
            { effective_to: null },
            { effective_to: { [Op.gte]: new Date() } },
          ],
        },
        order: [["effective_from", "DESC"]],
        transaction,
      });

      // Get last 5 years of underwriting (including the target year)
      const underwritingRows = await Underwriting.findAll({
        where: {
          fire_department_id: parseInt(fire_department_id),
        },
        order: [["underwriting_year", "DESC"]],
        limit: 5,
        transaction,
      });

      // --- Validation: require 5-year data and complete profile before running calculation ---
      if (!underwritingRows || underwritingRows.length < 5) {
        await transaction.rollback();
        return res.status(400).json({
          code: "MISSING_5_YEAR_DATA",
          message:
            "Cannot run analysis: underwriting data for the last 5 years is required. Please add or complete underwriting data (e.g. Losses, LAE, # Claims) for this fire department.",
        });
      }

      const targetRow = underwritingRows.find(
        (row) => row.underwriting_year === underwriting_year
      );
      if (!targetRow) {
        await transaction.rollback();
        return res.status(400).json({
          code: "MISSING_5_YEAR_DATA",
          message:
            "Cannot run analysis: the selected year is not in the last 5 years of underwriting data. Please add or complete underwriting data for this fire department.",
        });
      }

      const hasPremium =
        (Number(targetRow.vfbl) || 0) + (Number(targetRow.wc) || 0) > 0 ||
        (Number(targetRow.total_premium) || 0) > 0;
      if (!hasPremium) {
        await transaction.rollback();
        return res.status(400).json({
          code: "MISSING_5_YEAR_DATA",
          message:
            "Cannot run analysis: the selected year has no premium data (VFBL/WC). Please add or complete underwriting data.",
        });
      }

      if (!profile) {
        await transaction.rollback();
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
        const value = profile[field];
        if (value === undefined || value === null) return true;
        if (typeof value === "boolean") return false;
        if (typeof value === "number") return isNaN(value);
        if (typeof value === "string") return value.trim() === "";
        return false;
      });
      if (missingFields.length > 0) {
        await transaction.rollback();
        return res.status(400).json({
          code: "MISSING_PROFILE",
          message: `Fire department profile is incomplete. Missing: ${missingFields.join(", ")}. Please complete the profile (e.g. from approved application forms).`,
        });
      }

      // Run calculation
      const calculationResult = await calculationService.calculate(
        fireDepartment,
        profile,
        underwritingRows,
        underwriting_year,
        transaction
      );

      // Fields to store in underwriting_results (no assigned_category column there)
      const { assigned_category: _cat, ...resultFields } = calculationResult;

      // Upsert underwriting_results
      const [result, created] = await UnderwritingResults.findOrCreate({
        where: {
          fire_department_id: parseInt(fire_department_id),
          underwriting_year: underwriting_year,
        },
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

      // Update underwriting row with points and company_id
      const targetUnderwriting = await Underwriting.findOne({
        where: {
          fire_department_id: parseInt(fire_department_id),
          underwriting_year: underwriting_year,
        },
        transaction,
      });

      if (targetUnderwriting) {
        await targetUnderwriting.update(
          {
            points: calculationResult.total_points,
            company_id: calculationResult.assigned_company_id,
            // Store assigned category (FDM/FDI/FPI) in underwriting.category (model field: type)
            type: calculationResult.assigned_category,
          },
          { transaction }
        );
      }

      // Upsert policy
      const [policy, policyCreated] = await Policy.findOrCreate({
        where: {
          fire_department_id: parseInt(fire_department_id),
          underwriting_year: underwriting_year,
        },
        defaults: {
          fire_department_id: parseInt(fire_department_id),
          underwriting_year: underwriting_year,
          assigned_company_id: calculationResult.assigned_company_id,
        },
        transaction,
      });

      if (!policyCreated) {
        await policy.update(
          {
            assigned_company_id: calculationResult.assigned_company_id,
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
      await transaction.rollback();
      console.error("Error calculating analysis:", error);
      res.status(500).json({
        message: "Error calculating analysis",
        error: error.message,
      });
    }
  }
}

module.exports = new AnalysisController();



