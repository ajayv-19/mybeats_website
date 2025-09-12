const { Company, FormData } = require("../models");

class AgentController {
  setupRoutes(app) {
    app.post("/agentform/submit", (...args) => this.submitAgentForm(...args));
    app.post("/agentform/update", (...args) => this.updateAgentForm(...args));
    app.get("/agentforms", (...args) => this.getAgentForms(...args));
    app.get("/agentform/:formId", (...args) => this.getAgentFormById(...args));
  }


  async getAgentFormById(req, res) {
    const { formId } = req.params;
    try {
      const result = await FormData.findOne({
        where: {
          id: formId,
          type: "agent_form"
        }
      });
      res.status(200).json({
        "message": "Agent form retrieved successfully",
        "data": result
      });
    } catch (error) {
      res.status(500).json({
        "message": "Error retrieving agent form",
        "error": error.message
      });
    }
  }


  async getAgentForms(req, res) {
    const { company_id } = req.query;
    try {
      const result = await FormData.findAll({
        where: {
          company_id: company_id,
          type: "agent_form"
        }
      });
      res.status(200).json({
        "message": "Agent forms retrieved successfully",
        "data": result
      });
    } catch (error) {
      res.status(500).json({
        "message": "Error retrieving agent forms",
        "error": error.message
      });
    }
  }

  async submitAgentForm(req, res) {
    const { company_id, data, insurance_company, fire_department, status, updated_by } = req.body;
    const result = await FormData.create({
      name: "Agent Form for " + company_id,
      company_id: company_id,
      data: data,
      type: "agent_form",
      insurance_company: insurance_company || null,
      fire_department: fire_department || null,
      status: status || "active",
      updated_by: updated_by || null
    });
    try {
      res.status(200).json({
        "message": "Agent form submitted successfully",
        "data": result
      });
    } catch (error) {
      res.status(500).json({
        "message": "Error creating agent form",
        "error": error.message
      });
    }
  }

  async updateAgentForm(req, res) {
    const { id, data, insurance_company, fire_department, status, updated_by } = req.body;
    try {
      const updateData = { data: data };

      // Only update these fields if they are provided
      if (insurance_company !== undefined) {
        updateData.insurance_company = insurance_company;
      }
      if (fire_department !== undefined) {
        updateData.fire_department = fire_department;
      }
      if (status !== undefined) {
        updateData.status = status;
      }
      if (updated_by !== undefined) {
        updateData.updated_by = updated_by;
      }

      const result = await FormData.update(
        updateData,
        { where: { id: id } }
      );
      res.status(200).json({
        "message": "Agent form updated successfully",
        "data": {
          id: id,
          data: data,
          insurance_company: insurance_company,
          fire_department: fire_department,
          status: status,
          updated_by: updated_by
        }
      });
    } catch (error) {
      res.status(500).json({
        "message": "Error updating agent form",
        "error": error.message
      });
    }
  }
}

// TEST: See if the changes are being picked up

module.exports = new AgentController();
// Changed