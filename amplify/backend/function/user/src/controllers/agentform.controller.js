const { Company, FormData } = require("../models");

class AgentController {
  setupRoutes(app) {
    app.post("/agentform/submit", (...args) => this.submitAgentForm(...args));
    app.post("/agentform/update", (...args) => this.updateAgentForm(...args));
  }






  async submitAgentForm(req, res) {
    const { company_id, data } = req.body;
    const result = await FormData.create({
      name: "Agent Form for " + company_id,
      company_id: company_id,
      data: data,
      type: "agent_form"
    });
    try {
      res.status(200).json({
        "message": "Agent form submitted successfully",
        "data": result
      });
    } catch (error) {

    }
  }

  async updateAgentForm(req, res) {
    const { id, data } = req.body;
    try {
      const result = await FormData.update(
        { data: data },
        { where: { id: id } }
      );
      res.status(200).json({
        "message": "Agent form updated successfully",
        "data": {
          id: id,
          data: data
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