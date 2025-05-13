const { Company, User, NewSubscriptions } = require("../models");
class CompanyController {
  setupRoutes(app) {
    app.get("/company/:user_id", this.getCompany);
    app.post("/company", this.createCompany);
    app.put("/company", this.updateCompany);
    app.get(
      "/company/:company_id/subscription",
      this.getCompanySubscriptionDetails
    );
  }

  async createCompany(req, res) {
    try {
      const { name, address, phone_number, email, user_id, website } = req.body;

      // Find the user and check if they exist
      const user = await User.findOne({ where: { id: user_id } });
      if (!user) {
        return res.status(400).json({
          message: "User not found"
        });
      }

      // Find existing company by domain
      const existingCompany = await Company.findOne({
        where: { domain: user.domain }
      });

      let company;
      if (existingCompany) {
        // Update existing company
        company = await existingCompany.update({
          Company_Name: name,
          address,
          phone_number,
          email,
          //policyholder_count,
          website,
          // Keeping the original primary_user_id and domain
        });
      } else {
        // Create new company
        company = await Company.create({
          Company_Name: name,
          address,
          phone_number,
          email,
          website,
          primary_user_id: user.id,
          //policyholder_count,
          domain: user.domain,
          number_of_admins: 0,
          number_of_users_invited: 0,
          number_of_users_accepted: 0,
          license_used: 0
        });
      }

      // Update the creating user's company_id
      await user.update({ company_id: company.id });

      // Update company_id for all users with the same domain
      const users = await User.findAll({ where: { domain: user.domain } });
      await Promise.all(users.map(user =>
        user.update({ company_id: company.id })
      ));

      return res.status(200).json({
        message: existingCompany ? "Company updated successfully" : "Company created successfully",
        company,
      });

    } catch (error) {
      return res.status(500).json({
        message: "An error occurred while processing your request",
        error: error.message
      });
    }
  }


  async updateCompany(req, res) {
    const { id, name, address, phone, email } = req.body;
    const company = await Company.findByPk(id);
    if (!company) {
      return res.status(400).json({
        message: "Company not found",
      });
    }
    company.name = name;
    company.address = address;
    company.phone = phone;
    company.email = email;
    const updatedCompany = await company.save();
    if (!updatedCompany) {
      return res.status(400).json({
        message: "Company update failed",
      });
    }
    res.status(200).json({
      message: "Company updated successfully",
      company,
    });
  }

  async getCompany(req, res) {
    const { user_id } = req.params;
    const user = await User.findByPk(user_id);
    const company = await Company.findByPk(user.company_id);
    if (!company) {
      return res.status(400).json({
        message: "Company not found",
      });
    }
    res.status(200).json({
      company,
    });
  }

  async getCompanySubscriptionDetails(req, res) {
    const { company_id } = req.params;

    try {
      const subscription = await NewSubscriptions.findOne({
        where: { company_id },
      });

      if (!subscription) {
        return res.status(404).json({
          message: "Subscription not found",
        });
      }

      res.status(200).json({
        subscription,
      });
    } catch (error) {
      console.error("Error fetching subscription details:", error);
      res.status(500).json({
        message: "Failed to fetch subscription details",
        error: error.message,
      });
    }
  }
}

// TEST: See if the changes are being picked up

module.exports = new CompanyController();
// Changed