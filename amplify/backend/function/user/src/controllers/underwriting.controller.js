const {
  Underwriting,
  FireDepartment,
  Company,
  sequelize,
} = require("../models");
const { Op } = require("sequelize");

class UnderwritingController {
  setupRoutes(app) {
    app.get(
      "/underwriting/:fire_department_id/history",
      (...args) => this.getUnderwritingHistory(...args)
    );
    app.put(
      "/underwriting/:fire_department_id/:underwriting_year/carrier-input",
      (...args) => this.updateCarrierInput(...args)
    );
    app.put(
      "/underwriting/:fire_department_id/bulk-upsert",
      (...args) => this.bulkUpsertUnderwriting(...args)
    );
  }

  /**
   * GET /underwriting/:fire_department_id/history
   * Get underwriting history for a fire department (last 5 years)
   */
  async getUnderwritingHistory(req, res) {
    try {
      const { fire_department_id } = req.params;

      // Get last 5 years of underwriting data, ordered by year descending
      const underwritingRows = await Underwriting.findAll({
        where: {
          fire_department_id: parseInt(fire_department_id),
        },
        order: [["underwriting_year", "DESC"]],
        limit: 5,
        include: [
          {
            model: Company,
            as: "company",
            attributes: ["id", "Company_Name"],
            required: false,
          },
        ],
      });

      res.status(200).json({
        message: "Underwriting history retrieved successfully",
        data: underwritingRows,
      });
    } catch (error) {
      console.error("Error retrieving underwriting history:", error);
      res.status(500).json({
        message: "Error retrieving underwriting history",
        error: error.message,
      });
    }
  }

  /**
   * PUT /underwriting/:fire_department_id/:underwriting_year/carrier-input
   * Update carrier-owned inputs (losses, lae) for a specific year
   * Computes total_loss_lae and loss_ratio
   * Matches on company_id and form_id to ensure correct row is updated.
   * When form_id is provided: only UPDATE existing row (never create). Find by form_id + company_id + fire_department_id.
   * When form_id is not provided: find by fire_department_id + underwriting_year + company_id; create if not found.
   */
  async updateCarrierInput(req, res) {
    try {
      const { fire_department_id, underwriting_year } = req.params;
      const { losses, lae, company_id, form_id } = req.body;

      // Validate required fields for matching
      if (!company_id) {
        return res.status(400).json({
          message: "company_id is required in request body to identify the correct underwriting row",
        });
      }

      const fireDepartmentIdInt = parseInt(fire_department_id);
      const companyIdInt = parseInt(company_id);

      let underwriting;

      if (form_id) {
        // When form_id is provided: find the row created for this form (by form_id + company_id + fire_department_id).
        // Do NOT use underwriting_year from URL for lookup — the row's year is set when the form was approved.
        // Do NOT create a new row — we only update the existing underwriting row for this form.
        underwriting = await Underwriting.findOne({
          where: {
            fire_department_id: fireDepartmentIdInt,
            company_id: companyIdInt,
            form_id: parseInt(form_id),
          },
        });

        if (!underwriting) {
          console.warn(`[updateCarrierInput] No underwriting row found for form_id=${form_id}, company_id=${company_id}, fire_department_id=${fire_department_id}`);
          return res.status(400).json({
            message: "No underwriting row found for this form. Ensure the form was approved first; the underwriting row is created on approval.",
          });
        }
        console.log(`[updateCarrierInput] Found existing row for form: uw_id=${underwriting.uw_id}, year=${underwriting.underwriting_year}`);
      } else {
        // When form_id is not provided: match by fire_department_id, underwriting_year, company_id
        const whereClause = {
          fire_department_id: fireDepartmentIdInt,
          underwriting_year: underwriting_year,
          company_id: companyIdInt,
        };

        underwriting = await Underwriting.findOne({ where: whereClause });

        // Only create when form_id was not provided (legacy or non-form flow)
        if (!underwriting) {
          console.log(`[updateCarrierInput] Creating new underwriting row (no form_id) for company_id ${company_id}, year ${underwriting_year}`);
          underwriting = await Underwriting.create({
            fire_department_id: fireDepartmentIdInt,
            underwriting_year: underwriting_year,
            company_id: companyIdInt,
            form_id: null,
            losses: losses || null,
            lae: lae || null,
          });
        } else {
          console.log(`[updateCarrierInput] Found existing row: uw_id=${underwriting.uw_id}, year=${underwriting.underwriting_year}`);
        }
      }

      // Update only carrier-owned fields (losses, lae, optionally company_id)
      const updateData = {};
      if (losses !== undefined) {
        updateData.losses = losses;
      }
      if (lae !== undefined) {
        updateData.lae = lae;
      }
      if (company_id !== undefined) {
        updateData.company_id = company_id;
      }
      // Ensure form_id is set if provided
      if (form_id !== undefined && form_id !== null) {
        updateData.form_id = parseInt(form_id);
      }

      // Compute derived values for Underwriting table:
      // Total Premium = VFBL + WC
      // Total Loss/LAE = losses + lae
      // Loss ratio (%) = (Total Loss/LAE / Total Premium) * 100
      const currentVfbl = Number(underwriting.vfbl) || 0;
      const currentWc = Number(underwriting.wc) || 0;
      const updatedLosses = updateData.losses !== undefined ? updateData.losses : underwriting.losses;
      const updatedLae = updateData.lae !== undefined ? updateData.lae : underwriting.lae;

      updateData.total_premium = currentVfbl + currentWc;
      updateData.total_loss_lae = (Number(updatedLosses) || 0) + (Number(updatedLae) || 0);

      if (updateData.total_premium > 0) {
        updateData.loss_ratio = (updateData.total_loss_lae / updateData.total_premium) * 100;
      } else {
        updateData.loss_ratio = null;
      }

      await underwriting.update(updateData);

      res.status(200).json({
        message: "Carrier input updated successfully",
        data: underwriting,
      });
    } catch (error) {
      console.error("Error updating carrier input:", error);
      res.status(500).json({
        message: "Error updating carrier input",
        error: error.message,
      });
    }
  }

  /**
   * PUT /underwriting/:fire_department_id/bulk-upsert
   * Bulk upsert multiple underwriting rows (for 5-year grid)
   * Body: { rows: [{ underwriting_year, vfbl, wc, losses, lae, number_of_claims, company_id, ... }] }
   */
  async bulkUpsertUnderwriting(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { fire_department_id } = req.params;
      const { rows } = req.body;

      if (!Array.isArray(rows)) {
        return res.status(400).json({
          message: "Invalid request body. Expected 'rows' array.",
        });
      }

      const results = [];

      for (const row of rows) {
        const {
          underwriting_year,
          vfbl,
          wc,
          losses,
          lae,
          number_of_claims,
          company_id,
        } = row;

        if (!underwriting_year) {
          continue; // Skip rows without year
        }

        // Compute derived values
        const totalPremium = (vfbl || 0) + (wc || 0);
        const totalLossLae = (losses || 0) + (lae || 0);
        const lossRatio =
          totalPremium > 0 ? (totalLossLae / totalPremium) * 100 : null;

        const [underwriting, created] = await Underwriting.findOrCreate({
          where: {
            fire_department_id: parseInt(fire_department_id),
            underwriting_year: underwriting_year,
          },
          defaults: {
            fire_department_id: parseInt(fire_department_id),
            underwriting_year: underwriting_year,
            vfbl: vfbl || null,
            wc: wc || null,
            total_premium: totalPremium || null,
            losses: losses || null,
            lae: lae || null,
            total_loss_lae: totalLossLae || null,
            loss_ratio: lossRatio,
            number_of_claims: number_of_claims || null,
            company_id: company_id || null,
          },
          transaction,
        });

        // Update existing row (only update fields that are provided)
        const updateData = {};
        if (vfbl !== undefined) updateData.vfbl = vfbl;
        if (wc !== undefined) updateData.wc = wc;
        if (losses !== undefined) updateData.losses = losses;
        if (lae !== undefined) updateData.lae = lae;
        if (number_of_claims !== undefined)
          updateData.number_of_claims = number_of_claims;
        if (company_id !== undefined) updateData.company_id = company_id;

        // Recompute derived values
        const finalVfbl = updateData.vfbl !== undefined ? updateData.vfbl : (underwriting.vfbl || 0);
        const finalWc = updateData.wc !== undefined ? updateData.wc : (underwriting.wc || 0);
        const finalLosses = updateData.losses !== undefined ? updateData.losses : (underwriting.losses || 0);
        const finalLae = updateData.lae !== undefined ? updateData.lae : (underwriting.lae || 0);

        updateData.total_premium = finalVfbl + finalWc;
        updateData.total_loss_lae = finalLosses + finalLae;
        updateData.loss_ratio =
          updateData.total_premium > 0
            ? (updateData.total_loss_lae / updateData.total_premium) * 100
            : null;

        await underwriting.update(updateData, { transaction });

        results.push(underwriting);
      }

      await transaction.commit();

      res.status(200).json({
        message: "Underwriting rows updated successfully",
        data: results,
      });
    } catch (error) {
      await transaction.rollback();
      console.error("Error bulk upserting underwriting:", error);
      res.status(500).json({
        message: "Error bulk upserting underwriting",
        error: error.message,
      });
    }
  }
}

module.exports = new UnderwritingController();



