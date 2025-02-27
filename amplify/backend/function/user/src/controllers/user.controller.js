// const { is } = require("immutable");
const {
  User,
  Company,
  Subscriptions,
  NewSubscriptions,
  CustomerQueries,
  UserInvites,
} = require("../models");

const UserController = {
  async getUserById(req, res) {
    try {
      const payload = req.query;
      const user = await User.findOne({ where: payload });
      console.log(payload, "payload");
      console.log(user, "user");

      if (!user) {
        return res
          .status(404)
          .json({ success: false, error: "User not found" });
      }
      let company = null;
      if (user.company_id) {
        company = await Company.findOne({ where: { id: user.company_id } });
      } else {
        company = await Company.findOne({ where: { domain: user.domain } });
      }
      console.log(company, "company");

      let subscription = null;

 

      if (company) {
        subscription = await NewSubscriptions.findOne({
          where: { id: company.subscription_id },
        });
      }
      console.log(subscription, "subscription");

      let isactive = null;
      if (subscription) {
        if (subscription.status == "ACTIVE") {
          isactive = true;
          const currentDate = new Date();
          const expiryDate = new Date(subscription.bill_end);
          console.log(currentDate, "currentDate");
          console.log(expiryDate, "expiryDate");
          if (currentDate > expiryDate) {
            subscription.status = "INACTIVE";
            await subscription.update({ status: "INACTIVE" });
            isactive = false;
          }
        }
      } else {
        isactive = false;
      }

      const userdata = { user, company, isactive };
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

  async syncMyInvites(user) {
    const invite = await UserInvites.findOne({ where: { email: user.email } });
    if (!invite) {
      return false;
    }
    await invite.update({
      is_accepted: true,
      updated_at: new Date(),
    });
    await user.update({
      is_varified: true,
      is_invited: true,
      invited_by: invite.invitedBy,
    });
    return invite;
  },

  async addOrUpdateUserDetails(req, res) {
    try {
      const {
        email,
        role_id,
        Customer_Name,
        usertype,
        image,
        removedByAdmin,
        invited_by = 0,
      } = req.body;

      if (!email || !Customer_Name) {
        return res.status(400).json({
          success: false,
          error: "Email and Customer Name are required",
        });
      }
      const domain = email.split("@")[1];
      let company_id;

      const created_timestamp = new Date().toISOString();

      // Find the existing user by email
      const existingUser = await User.findOne({ where: { email } });
      // If the user exists, update only the fields that are not null
      if (existingUser) {
        const updatedUser = await existingUser.update({
          username: (existingUser.username != req?.cognitoUser?.username) ? req?.cognitoUser?.username : existingUser.username,
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
        });
        await this.syncMyInvites(updatedUser);
        return res.json({
          success: true,
          message: "User updated successfully",
          user: updatedUser,
        });
      }

      const company = await Company.findOne({ where: { domain } });
      if (company) {
        company_id = company.id;
      }

      // If the user does not exist, create a new user
      const newUser = await User.create({
        email,
        username: req?.cognitoUser?.username || username,
        role_id,
        Customer_Name,
        usertype,
        created_timestamp,
        image,
        domain,
        removedByAdmin,
        is_varified: false,
        is_invited: invited_by ? 1 : 0,
        invited_by,
        ...(company_id && { company_id }),
      });

      await this.syncMyInvites(newUser);

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

  async updateUserRole(req, res) {
    const { email, role } = req.body;

    // Determine role_id based on the role
    let role_id;
    if (role === "READER") {
      role_id = 2;
    } else if (role === "ADMIN") {
      role_id = 1;
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid role provided",
      });
    }

    try {
      // Find the user by email
      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Update the user's role_id
      user.role_id = role_id;
      await user.save();

      return res.json({
        success: true,
        message: "User role updated successfully",
        user,
      });
    } catch (error) {
      console.error("Error updating user role:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update user role",
        error: error.message,
      });
    }
  },

  async addComment(req, res) {
    const { email, firstName, lastName, message } = req.body;

    // Determine role_id based on the role

    try {
      // Find the user by email
      // const user = await User.findOne({ where: { email } });

      // if (!user) {
      //   return res.status(404).json({
      //     success: false,
      //     message: "User not found",
      //   });
      // }

      // Create a new comment
      const newComment = await CustomerQueries.create({
        email,
        firstName,
        lastName,
        message,
      });

      return res.json({
        success: true,
        message: "Comment added successfully",
        newComment,
      });
    } catch (error) {
      console.error("Error adding the comment:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update user role",
        error: error.message,
      });
    }
  },
};

module.exports = UserController;

// Bank, Apple pay, Card, G-pay.
