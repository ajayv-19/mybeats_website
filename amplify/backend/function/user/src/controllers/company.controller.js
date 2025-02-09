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
    const { name, address, phone_number, email, user_id, policyholder_count } =
      req.body;
    const user = await User.findOne({ where: { id: user_id } });
    const company_exists = await Company.findOne({
      where: { domain: user.domain },
    });
    const primary_user_id = user.id;
    if (company_exists) {
      return res.status(400).json({
        message: "Company already exists",
      });
    }

    const company = await Company.create({
      Company_Name: name,
      address,
      phone_number,
      email,
      primary_user_id,
      policyholder_count,
      domain: user.domain,
    });
    if (!company) {
      return res.status(400).json({
        message: "Company creation failed",
      });
    } else if (user) {
      user.update({ company_id: company.id });
      // check we have a users with the same domain and update their company_id
      const users = await User.findAll({ where: { domain: user.domain } });
      if (users) {
        users.forEach(async (user) => {
          user.update({ company_id: company.id });
        });
      }
    } else {
      return res.status(400).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "Company created successfully",
      company,
    });
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

module.exports = new CompanyController();
