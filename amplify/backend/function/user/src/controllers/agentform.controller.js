const { Company, FormData, FireDepartment, FormMessage, DocumentAttachment } = require("../models");
const { extractFormData } = require("../services/formExtraction.service");
const { Op } = require("sequelize");
const uploadDocuments = require("../config/multerDocuments");

class AgentController {
  setupRoutes(app) {
    app.post("/agentform/submit", (...args) => this.submitAgentForm(...args));
    app.post("/agentform/update", (...args) => this.updateAgentForm(...args));
    app.post("/agentform/approveOrReject", (...args) => this.approveOrRejectAgentForm(...args));
    app.get("/agentforms", (...args) => this.getAgentForms(...args));
    app.get("/agentform/:formId", (...args) => this.getAgentFormById(...args));
    app.get("/agentform/:formId/fire-department-id", (...args) => this.getFireDepartmentId(...args));
    app.get("/agentform/:formId/fire-department", (...args) => this.getFireDepartmentForForm(...args));
    app.get("/fire-departments", (...args) => this.getFireDepartments(...args));
    // Message routes
    app.get("/agentform/:formId/getMessages", (...args) => this.getMessages(...args));
    app.post("/agentform/:formId/sendMessage", (...args) => this.sendMessage(...args));
    app.post("/agentform/:formId/markAsRead", (...args) => this.markAsRead(...args));
    // Document upload route
    app.post("/agentform/:formId/uploadDocument", uploadDocuments.single("file"), (...args) => this.uploadDocument(...args));
    // Document attachments route
    app.get("/agentform/:formId/attachments", (...args) => this.getAttachments(...args));
    // Alias route for broker form compatibility (broker form calls /attachments/:formId)
    app.get("/attachments/:formId", (...args) => this.getAttachments(...args));
  }


  async getAgentFormById(req, res) {
    const { formId } = req.params;
    const maxRetries = 3;
    let retries = 0;

    // Parse formId as integer
    const parsedFormId = parseInt(formId, 10);
    if (isNaN(parsedFormId)) {
      return res.status(400).json({
        message: "Invalid form ID. Must be a number.",
        error: `Form ID "${formId}" is not a valid number`
      });
    }

    while (retries < maxRetries) {
      try {
        console.log(`[getAgentFormById] Fetching form with ID: ${parsedFormId}, attempt ${retries + 1}`);
        
        const result = await FormData.findOne({
          where: { id: parsedFormId }
        });

        if (!result) {
          console.log(`[getAgentFormById] Form ${parsedFormId} not found`);
          return res.status(404).json({
            message: "Agent form not found",
            data: null
          });
        }

        console.log(`[getAgentFormById] Successfully retrieved form ${parsedFormId}`);
        return res.status(200).json({
          message: "Agent form retrieved successfully",
          data: result
        });
      } catch (error) {
        console.error(`[getAgentFormById] Error on attempt ${retries + 1}:`, error);
        console.error(`[getAgentFormById] Error stack:`, error.stack);
        
        // Check if it's a connection error
        if (error.message && (
          error.message.includes('too many connections') ||
          error.message.includes('connection') ||
          error.code === 'ECONNREFUSED' ||
          error.code === 'ETIMEDOUT'
        )) {
          retries++;
          if (retries >= maxRetries) {
            console.error(`[getAgentFormById] Max retries reached for form ${parsedFormId}`);
            return res.status(503).json({
              message: "Database temporarily unavailable. Please try again in a moment.",
              error: "Connection pool exhausted"
            });
          }
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * retries));
          continue;
        }

        // Other errors - return detailed error message
        console.error(`[getAgentFormById] Non-retryable error for form ${parsedFormId}:`, error.message);
        return res.status(500).json({
          message: "Error retrieving agent form",
          error: error.message || "Unknown error occurred",
          details: error.stack ? error.stack.split('\n').slice(0, 5).join('\n') : undefined
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
          application_status: "Submitted",
        },
      });
      res.status(200).json({
        "message": "Agent forms retrieved successfully",
        "data": result,
      });
    } catch (error) {
      res.status(500).json({
        "message": "Error retrieving agent forms",
        "error": error.message,
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

      // Prevent rejecting approved forms (data already stored in database)
      if (form.status === "Approved" && newStatus === "Rejected") {
        return res.status(400).json({
          "message": "Cannot reject an approved form. Data has already been stored in the database (underwriting and fire_department_profile tables)."
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

  /**
   * GET /agentform/:formId/fire-department
   * Return the single fire department linked to a form record. Use this in the
   * read-only carrier preview (broker iframe) instead of fetching all FDs for the
   * company and filtering on the client.
   *
   * Resolution:
   *   1) FormData.fire_department_id → FireDepartment.findByPk (preferred, FK)
   *   2) FormData.fire_department    → FireDepartment.findOne(name + company_id)
   */
  async getFireDepartmentForForm(req, res) {
    const { formId } = req.params;
    const parsedFormId = parseInt(formId, 10);
    if (!Number.isFinite(parsedFormId)) {
      return res.status(400).json({
        message: "Invalid form ID. Must be a number.",
      });
    }

    try {
      const form = await FormData.findByPk(parsedFormId);
      if (!form) {
        return res.status(404).json({ message: "Form not found" });
      }

      let fireDepartment = null;
      if (form.fire_department_id != null) {
        fireDepartment = await FireDepartment.findByPk(form.fire_department_id);
      }
      if (!fireDepartment && form.fire_department) {
        fireDepartment = await FireDepartment.findOne({
          where: {
            fire_department_name: form.fire_department,
            company_id: form.company_id,
          },
        });
      }

      if (!fireDepartment) {
        return res.status(404).json({
          message: "Fire department not found for this form.",
        });
      }

      res.status(200).json({
        message: "Fire department retrieved successfully",
        data: {
          fire_department_id: fireDepartment.fire_department_id,
          fire_department_name: fireDepartment.fire_department_name,
          county: fireDepartment.county,
          state: fireDepartment.state,
          company_id: fireDepartment.company_id,
        },
      });
    } catch (error) {
      console.error("Error getting fire department for form:", error);
      res.status(500).json({
        message: "Error getting fire department for form",
        error: error.message || "Unknown error occurred",
      });
    }
  }

  /**
   * Resolve subscribed company from a fire department id (Form_Data or fire_departments).
   */
  async _resolveCompanyIdFromFireDepartmentId(fdIdRaw, source) {
    const parsed = parseInt(fdIdRaw, 10);
    if (!Number.isFinite(parsed)) return null;

    try {
      const formRow = await FormData.findOne({
        where: { fire_department_id: parsed },
        order: [["id", "DESC"]],
        attributes: ["company_id", "fire_department_id"],
      });
      if (formRow?.company_id != null) {
        console.log(
          `[getFireDepartments] Extracted company_id ${formRow.company_id} from ${source} ${parsed} (Form_Data)`,
        );
        return formRow.company_id;
      }

      const fd = await FireDepartment.findByPk(parsed, {
        attributes: ["company_id"],
      });
      if (fd?.company_id != null) {
        console.log(
          `[getFireDepartments] Extracted company_id ${fd.company_id} from ${source} ${parsed} (fire_departments)`,
        );
        return fd.company_id;
      }
    } catch (err) {
      console.warn(
        `[getFireDepartments] Could not resolve company_id from ${source} ${parsed}:`,
        err.message,
      );
    }
    return null;
  }

  /**
   * GET /fire-departments?company_id=...&editFormId=...&form_id=...&fire_department_id=...
   * Get list of fire departments for a company (broker dropdown).
   *
   * Resolution order for company_id (first match wins):
   *   1) ?company_id=
   *   2) ?editFormId= / ?form_id= → Form_Data.company_id
   *   3) ?fire_department_id= → Form_Data (latest row) or fire_departments.company_id
   *   4) Referer ?company_id= / ?editFormId= / ?form_id= / ?fire_department_id=
   *
   * If company_id still cannot be resolved but ?fire_department_id= is valid,
   * returns a one-item list for that department (read-only carrier view).
   */
  async getFireDepartments(req, res) {
    const isMissing = (v) =>
      v === undefined ||
      v === null ||
      v === "" ||
      v === "undefined" ||
      v === "null";

    const fdListAttributes = [
      "fire_department_id",
      "fire_department_name",
      "county",
      "state",
      "company_id",
    ];

    const resolveCompanyIdFromForm = async (formIdRaw, source) => {
      const parsed = parseInt(formIdRaw, 10);
      if (!Number.isFinite(parsed)) return null;
      try {
        const form = await FormData.findByPk(parsed);
        if (form && form.company_id != null) {
          console.log(
            `[getFireDepartments] Extracted company_id ${form.company_id} from ${source} ${parsed}`,
          );
          return form.company_id;
        }
        if (form && form.fire_department_id != null) {
          const fromFd = await this._resolveCompanyIdFromFireDepartmentId(
            form.fire_department_id,
            `${source} (via form ${parsed} fire_department_id)`,
          );
          if (fromFd != null) return fromFd;
        }
      } catch (formError) {
        console.warn(
          `[getFireDepartments] Could not extract company_id from ${source} ${parsed}:`,
          formError.message,
        );
      }
      return null;
    };

    try {
      let { company_id, editFormId, form_id, fire_department_id } = req.query;

      if (isMissing(company_id) && !isMissing(editFormId)) {
        company_id = await resolveCompanyIdFromForm(editFormId, "editFormId");
      }
      if (isMissing(company_id) && !isMissing(form_id)) {
        company_id = await resolveCompanyIdFromForm(form_id, "form_id");
      }
      if (isMissing(company_id) && !isMissing(fire_department_id)) {
        company_id = await this._resolveCompanyIdFromFireDepartmentId(
          fire_department_id,
          "fire_department_id",
        );
      }

      // Fallback: pull from the Referer URL (broker iframe URL has editFormId, etc.)
      if (isMissing(company_id)) {
        const referer = req.headers.referer || req.headers.referrer;
        if (referer) {
          try {
            const refUrl = new URL(referer);
            const refCompanyId = refUrl.searchParams.get("company_id");
            const refEditFormId = refUrl.searchParams.get("editFormId");
            const refFormId = refUrl.searchParams.get("form_id");
            const refFireDepartmentId =
              refUrl.searchParams.get("fire_department_id");

            if (!isMissing(refCompanyId)) {
              company_id = refCompanyId;
              console.log(
                `[getFireDepartments] Resolved company_id ${company_id} from Referer company_id`,
              );
            } else if (!isMissing(refEditFormId)) {
              company_id = await resolveCompanyIdFromForm(
                refEditFormId,
                "Referer editFormId",
              );
            } else if (!isMissing(refFormId)) {
              company_id = await resolveCompanyIdFromForm(
                refFormId,
                "Referer form_id",
              );
            } else if (!isMissing(refFireDepartmentId)) {
              company_id = await this._resolveCompanyIdFromFireDepartmentId(
                refFireDepartmentId,
                "Referer fire_department_id",
              );
            }
          } catch (refErr) {
            console.warn(
              `[getFireDepartments] Referer parse failed:`,
              refErr.message,
            );
          }
        }
      }

      const companyIdInt = parseInt(company_id, 10);
      const fdIdInt = parseInt(fire_department_id, 10);

      if (!Number.isFinite(companyIdInt)) {
        if (Number.isFinite(fdIdInt)) {
          const single = await FireDepartment.findByPk(fdIdInt, {
            attributes: fdListAttributes,
          });
          if (single) {
            return res.status(200).json({
              message: "Fire department retrieved successfully",
              data: [single],
            });
          }
        }
        return res.status(400).json({
          message:
            "company_id could not be resolved. Pass ?company_id=, ?editFormId=, ?form_id=, or ?fire_department_id= (Referer query params are also checked).",
        });
      }

      const fireDepartments = await FireDepartment.findAll({
        where: { company_id: companyIdInt },
        attributes: fdListAttributes,
        order: [["fire_department_name", "ASC"]],
      });

      res.status(200).json({
        message: "Fire departments retrieved successfully",
        data: fireDepartments,
      });
    } catch (error) {
      console.error("Error getting fire departments:", error);
      res.status(500).json({
        message: "Error getting fire departments",
        error: error.message || "Unknown error occurred",
      });
    }
  }

  /**
   * GET /agentform/:formId/getMessages
   * Get all messages for a form
   * Returns messages with sender_id and receiver_id (email addresses)
   */
  async getMessages(req, res) {
    try {
      const { formId } = req.params;
      const parsedFormId = parseInt(formId, 10);

      if (isNaN(parsedFormId)) {
        return res.status(400).json({
          message: "Invalid form ID",
        });
      }

      const messages = await FormMessage.findAll({
        where: {
          form_id: parsedFormId,
        },
        order: [["created_at", "ASC"]],
      });

      res.status(200).json({
        message: "Messages retrieved successfully",
        data: messages,
      });
    } catch (error) {
      console.error("Error getting messages:", error);
      res.status(500).json({
        message: "Error getting messages",
        error: error.message,
      });
    }
  }

  /**
   * POST /agentform/:formId/sendMessage
   * Send a message for a form
   * Body: { message, type, sender_id, receiver_id }
   * sender_id and receiver_id are email addresses (VARCHAR)
   * message is stored as JSON: { "message": "...", "type": "text" } or { "message": "url", "type": "file" }
   */
  async sendMessage(req, res) {
    try {
      const { formId } = req.params;
      const { message, type, sender_id, receiver_id } = req.body;
      const parsedFormId = parseInt(formId, 10);

      if (isNaN(parsedFormId)) {
        return res.status(400).json({
          message: "Invalid form ID",
        });
      }

      if (!message || !sender_id || !receiver_id) {
        return res.status(400).json({
          message: "message, sender_id, and receiver_id are required",
        });
      }

      // Determine message type: "text" for normal messages, "file" for file uploads
      const messageType = type || (message.startsWith("http") ? "file" : "text");

      // Store message as JSON object (matches database JSON type)
      const messageData = {
        message: message,
        type: messageType,
      };

      const newMessage = await FormMessage.create({
        form_id: parsedFormId,
        sender_id: sender_id, // VARCHAR - email address
        receiver_id: receiver_id, // VARCHAR - email address
        message: messageData, // JSON object
        read: false,
      });

      // Ensure message is properly serialized for JSON response
      const messageResponse = newMessage.toJSON();
      
      res.status(200).json({
        message: "Message sent successfully",
        data: messageResponse,
      });
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({
        message: "Error sending message",
        error: error.message,
      });
    }
  }

  /**
   * POST /agentform/:formId/uploadDocument
   * Upload a document file and create a message with the file URL
   * Body: { sender_id, receiver_id } + file (multipart/form-data)
   */
  async uploadDocument(req, res) {
    try {
      const { formId } = req.params;
      const { sender_id, receiver_id } = req.body;
      const parsedFormId = parseInt(formId, 10);

      if (isNaN(parsedFormId)) {
        return res.status(400).json({
          message: "Invalid form ID",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          message: "No file uploaded",
        });
      }

      if (!sender_id || !receiver_id) {
        return res.status(400).json({
          message: "sender_id and receiver_id are required",
        });
      }

      // Get the S3 file URL
      const fileUrl = req.file.location; // multer-s3 provides this

      // Create message with file URL
      const messageData = {
        message: fileUrl,
        type: "file",
      };

      const newMessage = await FormMessage.create({
        form_id: parsedFormId,
        sender_id: sender_id, // VARCHAR - email address
        receiver_id: receiver_id, // VARCHAR - email address
        message: messageData, // JSON object with file URL
        read: false,
      });

      res.status(200).json({
        message: "Document uploaded and message created successfully",
        data: {
          ...newMessage.toJSON(),
          fileUrl: fileUrl,
          fileName: req.file.originalname,
        },
      });
    } catch (error) {
      console.error("Error uploading document:", error);
      res.status(500).json({
        message: "Error uploading document",
        error: error.message,
      });
    }
  }

  /**
   * POST /agentform/:formId/markAsRead
   * Mark messages as read
   * Body: { msgIds: "1,2,3" } (comma-separated string)
   */
  async markAsRead(req, res) {
    try {
      const { formId } = req.params;
      const { msgIds } = req.body;
      const parsedFormId = parseInt(formId, 10);

      if (isNaN(parsedFormId)) {
        return res.status(400).json({
          message: "Invalid form ID",
        });
      }

      if (!msgIds) {
        return res.status(400).json({
          message: "msgIds is required",
        });
      }

      // Parse comma-separated string to array of integers
      const messageIds = msgIds
        .split(",")
        .map((id) => parseInt(id.trim(), 10))
        .filter((id) => !isNaN(id));

      if (messageIds.length === 0) {
        return res.status(400).json({
          message: "No valid message IDs provided",
        });
      }

      const result = await FormMessage.update(
        { read: true },
        {
          where: {
            form_id: parsedFormId,
            id: { [Op.in]: messageIds },
          },
        }
      );

      res.status(200).json({
        message: "Messages marked as read successfully",
        data: {
          updated: result[0],
        },
      });
    } catch (error) {
      console.error("Error marking messages as read:", error);
      res.status(500).json({
        message: "Error marking messages as read",
        error: error.message,
      });
    }
  }

  /**
   * GET /agentform/:formId/attachments
   * Get all document attachments for a form from our database
   */
  async getAttachments(req, res) {
    try {
      const { formId } = req.params;
      const parsedFormId = parseInt(formId, 10);

      if (isNaN(parsedFormId)) {
        return res.status(400).json({
          message: "Invalid form ID",
        });
      }

      console.log(`[getAttachments] Fetching attachments for formId: ${parsedFormId}`);

      // Fetch attachments from our database (Documents_attachment table)
      const attachments = await DocumentAttachment.findAll({
        where: {
          form_id: parsedFormId,
        },
        order: [["created_at", "ASC"]],
      });

      console.log(`[getAttachments] Found ${attachments.length} attachments for formId: ${parsedFormId}`);

      // Ensure CORS headers are set
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Methods", "GET, OPTIONS");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");

      res.status(200).json({
        message: "Attachments retrieved successfully",
        data: attachments.map(att => att.toJSON()),
      });
    } catch (error) {
      console.error("Error getting attachments:", error);
      
      // Ensure CORS headers are set even on error
      res.header("Access-Control-Allow-Origin", "*");
      
      res.status(500).json({
        message: "Error getting attachments",
        error: error.message,
      });
    }
  }
}

// TEST: See if the changes are being picked up

module.exports = new AgentController();
// Changed