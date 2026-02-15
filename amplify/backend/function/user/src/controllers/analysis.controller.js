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
    app.post("/analysis/:fire_department_id/calculate", (...args) =>
      this.calculateAnalysis(...args)
    );
  }

  /**
   * GET /analysis/list?company_id=...
   * Get list of fire departments for analysis
   * Includes departments with submitted applications OR approved policies
   */
  async getAnalysisList(req, res) {
    try {
      const { company_id } = req.query;

      if (!company_id) {
        return res.status(400).json({
          message: "company_id query parameter is required",
        });
      }

      // Get fire departments that have:
      // 1. Submitted applications to this carrier (Form_Data with company_id)
      // 2. OR have approved policies with this carrier

      // Get fire department IDs from Form_Data
      const formsWithFD = await FormData.findAll({
        where: { company_id: parseInt(company_id) },
        attributes: ["fire_department"],
        group: ["fire_department"],
      });

      const fdNamesFromForms = formsWithFD
        .map((f) => f.fire_department)
        .filter((name) => name);

      // Get fire departments by name or by company_id
      const fireDepartments = await FireDepartment.findAll({
        where: {
          [Op.or]: [
            { company_id: parseInt(company_id) },
            { fire_department_name: { [Op.in]: fdNamesFromForms } },
          ],
        },
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

      // Run calculation
      const calculationResult = await calculationService.calculate(
        fireDepartment,
        profile,
        underwritingRows,
        underwriting_year,
        transaction
      );

      // Upsert underwriting_results
      const [result, created] = await UnderwritingResults.findOrCreate({
        where: {
          fire_department_id: parseInt(fire_department_id),
          underwriting_year: underwriting_year,
        },
        defaults: {
          fire_department_id: parseInt(fire_department_id),
          underwriting_year: underwriting_year,
          ...calculationResult,
        },
        transaction,
      });

      if (!created) {
        await result.update(calculationResult, { transaction });
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



