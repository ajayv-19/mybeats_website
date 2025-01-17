const { User, Company } = require("../models");
const UserController = {
  async getUserById(req, res) {
    try {
      const payload = req.query;
      const user = await User.findOne({ where: payload });
      if (!user) {
        return res
          .status(404)
          .json({ success: false, error: "User not found" });
      }
      const company = await Company.findOne({ where: { domain: user.domain } });
      //const admin = await User.findOne({ where: { id: company.admin_id } });
      // user.company = company;

      //const userdata = { user, company, admin };
      const userdata = { user, company };
      res.json({ success: true, userdata });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ success: false, error: "Failed to fetch user" });
    }
  },

  async canShowBilling(req, res) {
    const payload = req.query;
    payload.is_varified = true;
    const user = await User.findOne({ where: payload });
    const company = await Company.findOne({ where: { domain: user.domain } });
    let flag = false;
    if (company && user.role_id == 1) {
      // role_id:1 is ADMIN
      flag = true;
    } else if (!company) {
      flag = true;
    }
    res.json({ success: true, flag });
  },

  async checkUserById(req, res) {
    try {
      const payload = req.query;
      payload.is_varified = true;
      const user = await User.findOne({ where: payload });

      // user.company = company;

      if (!user) {
        return res
          .status(404)
          .json({ success: false, error: "User not found" });
      }

      res.status(200).json({ success: true, user });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ success: false, error: "Failed to fetch user" });
    }
  },

  async updateUser(req, res) {
    try {
      const userData = req.body;
      const [updated] = await User.update(userData, {
        where: { email: userData.email },
      });

      if (!updated) {
        return res
          .status(404)
          .json({ success: false, error: "User not found" });
      }

      res.json({ success: true, message: "User updated successfully" });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ success: false, error: "Failed to update user" });
    }
  },

  async addOrUpdateUserDetails(req, res) {
    try {
      const {
        email,
        username,
        role_id,
        Customer_Name,
        usertype,
        image,
        removedByAdmin,
      } = req.body;

      if (!email || !Customer_Name) {
        return res.status(400).json({
          success: false,
          error: "Email and Customer Name are required",
        });
      }
      const domain = email.split("@")[1];
      let company_id;
      const company = await Company.findOne({ where: { domain } });
      if (company) {
        company_id = company.id;
      }

      const created_timestamp = new Date().toISOString();

      // Find the existing user by email
      const existingUser = await User.findOne({ where: { email } });

      // If the user exists, update only the fields that are not null
      if (existingUser) {
        const updatedUser = await existingUser.update({
          username: username !== null ? username : existingUser.username,
          role_id: role_id !== null ? role_id : existingUser.role_id,
          Customer_Name:
            Customer_Name !== null ? Customer_Name : existingUser.Customer_Name,
          usertype: usertype !== null ? usertype : existingUser.usertype,
          created_timestamp:
            created_timestamp !== null
              ? created_timestamp
              : existingUser.created_timestamp,
          image: image !== null ? image : existingUser.image,
          removedByAdmin:
            removedByAdmin !== null
              ? removedByAdmin
              : existingUser.removedByAdmin,
          domain: domain !== null ? domain : existingUser.domain,
          ...(company_id && { company_id }),
        });

        return res.json({
          success: true,
          message: "User updated successfully",
          user: updatedUser,
        });
      }

      // If the user does not exist, create a new user
      const newUser = await User.create({
        email,
        username,
        role,
        Customer_Name,
        usertype,
        created_timestamp,
        image,
        domain,
        removedByAdmin,
        is_varified: 1,
        is_invited: 0,
        invited_by: 0,
        ...(comapany_id && { company_id }),
      });

      res.json({
        success: true,
        message: "User created successfully",
        user: newUser,
      });
    } catch (error) {
      console.error("Error updating user details:", error);
      res
        .status(500)
        .json({ success: false, error: "Failed to update user details" });
    }
  },
};

module.exports = UserController;
