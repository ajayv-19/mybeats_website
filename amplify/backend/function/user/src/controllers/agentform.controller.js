const { Company, FormData, FireDepartment } = require("../models");
const { extractFormData } = require("../services/formExtraction.service");
const { Op } = require("sequelize");

class AgentController {
  setupRoutes(app) {
    app.post("/agentform/submit", (...args) => this.submitAgentForm(...args));
    app.post("/agentform/update", (...args) => this.updateAgentForm(...args));
    app.post("/agentform/approveOrReject", (...args) => this.approveOrRejectAgentForm(...args));
    app.get("/agentforms", (...args) => this.getAgentForms(...args));
    app.get("/agentform/:formId", (...args) => this.getAgentFormById(...args));
    app.get("/agentform/:formId/fire-department-id", (...args) => this.getFireDepartmentId(...args));
  }


  async getAgentFormById(req, res) {
    const { formId } = req.params;
    const maxRetries = 3;
    let retries = 0;

    while (retries < maxRetries) {
      try {
        const result = await FormData.findOne({
          where: { id: formId }
        });

        if (!result) {
          return res.status(404).json({
            message: "Agent form not found",
            data: null
          });
        }

        return res.status(200).json({
          message: "Agent form retrieved successfully",
          data: result
        });
      } catch (error) {
        // Check if it's a connection error
        if (error.message && (
          error.message.includes('too many connections') ||
          error.message.includes('connection') ||
          error.code === 'ECONNREFUSED' ||
          error.code === 'ETIMEDOUT'
        )) {
          retries++;
          if (retries >= maxRetries) {
            return res.status(503).json({
              message: "Database temporarily unavailable. Please try again in a moment.",
              error: "Connection pool exhausted"
            });
          }
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * retries));
          continue;
        }

        // Other errors
        return res.status(500).json({
          message: "Error retrieving agent form",
          error: error.message
        });
      }
    }
  }


  async getAgentForms(req, res) {
    const { company_id } = req.query;
    try {
      const result = await FormData.findAll({
        where: {
          company_id: company_id,
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
      status: status || "Pending",
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

  async approveOrRejectAgentForm(req, res) {
    const { id, application_status } = req.body;
    const updatedBy = req.user?.email || req.user?.username || "system"; // Get user from auth context
    
    try {
      // Map the application_status to the new status values
      // Frontend sends "Approved" | "Rejected" | "Pending"; also accept "approve" | "reject"
      let newStatus;
      const action = String(application_status || "").toLowerCase();
      if (application_status === "Approved" || action === "approve") {
        newStatus = "Approved";
      } else if (application_status === "Rejected" || action === "reject") {
        newStatus = "Rejected";
      } else if (application_status === "Pending") {
        newStatus = "Pending";
      } else {
        return res.status(400).json({
          "message": "Invalid application_status. Must be 'approve'/'Approved', 'reject'/'Rejected', or 'Pending'"
        });
      }

      // Fetch form to check for duplicates and get year
      const form = await FormData.findOne({
        where: { id }
      });

      if (!form) {
        return res.status(404).json({
          "message": "Agent form not found"
        });
      }

      // If approving, check for duplicate approval
      if (newStatus === "Approved") {
        // Extract policy year from form data if not already set
        let policyYear = form.year;
        if (!policyYear && form.data) {
          const formDataArray = Array.isArray(form.data) ? form.data : [];
          const flattenedData = {};
          formDataArray.forEach(section => {
            if (section && section.data) {
              Object.assign(flattenedData, section.data);
            }
          });
          
          if (flattenedData.effective_date) {
            const date = new Date(flattenedData.effective_date);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            policyYear = month >= 6 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
          }
        }

        // Check for duplicate approved form (same fire_department_id + year)
        if (form.fire_department_id && policyYear) {
          const duplicate = await FormData.findOne({
            where: {
              fire_department_id: form.fire_department_id,
              year: policyYear,
              status: "Approved",
              id: { [Op.ne]: id }, // Exclude current form
            }
          });

          if (duplicate) {
            return res.status(400).json({
              "message": "Cannot approve form: An approved form already exists for this fire department and policy year"
            });
          }
        }
      }

      // Update form status
      const updateData = { status: newStatus };
      if (newStatus === "Approved") {
        updateData.application_status = "Submitted";
      }

      const result = await FormData.update(
        updateData,
        { where: { id } }
      );

      if (result[0] === 0) {
        return res.status(404).json({
          "message": "Agent form not found"
        });
      }

      // If approving, extract form data and populate underwriting/profile tables
      if (newStatus === "Approved") {
        try {
          await extractFormData(id, updatedBy);
        } catch (extractionError) {
          console.error("Error extracting form data:", extractionError);
          // Don't fail the approval, but log the error
          // You may want to return a warning or handle this differently
          return res.status(200).json({
            "message": `Agent form approved successfully, but there was an error extracting form data: ${extractionError.message}`,
            "data": {
              id: id,
              status: newStatus
            },
            "warning": extractionError.message
          });
        }
      }

      res.status(200).json({
        "message": `Agent form ${newStatus === "Approved" ? "approved" : newStatus === "Rejected" ? "rejected" : "updated"} successfully`,
        "data": {
          id: id,
          status: newStatus
        }
      });
    } catch (error) {
      console.error("Error in approveOrRejectAgentForm:", error);
      res.status(500).json({
        "message": "Error updating agent form status",
        "error": error.message
      });
    }
  }

  /**
   * GET /agentform/:formId/fire-department-id
   * Get or create fire department ID for a form
   */
  async getFireDepartmentId(req, res) {
    const { formId } = req.params;
    try {
      const form = await FormData.findByPk(formId);
      if (!form) {
        return res.status(404).json({
          message: "Form not found",
        });
      }

      if (!form.fire_department) {
        return res.status(400).json({
          message: "Form does not have a fire department name",
        });
      }

      // Find or create fire department
      const [fireDepartment, created] = await FireDepartment.findOrCreate({
        where: {
          fire_department_name: form.fire_department,
          company_id: form.company_id,
        },
        defaults: {
          fire_department_name: form.fire_department,
          company_id: form.company_id,
        },
      });

      res.status(200).json({
        message: "Fire department ID retrieved successfully",
        data: {
          fire_department_id: fireDepartment.fire_department_id,
          created: created,
        },
      });
    } catch (error) {
      console.error("Error getting fire department ID:", error);
      res.status(500).json({
        message: "Error getting fire department ID",
        error: error.message,
      });
    }
  }
}

// TEST: See if the changes are being picked up

module.exports = new AgentController();
// Changed