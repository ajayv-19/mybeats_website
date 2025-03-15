// const { is } = require("immutable");
const {
  User,
  Company,
  Subscriptions,
  NewSubscriptions,
  CustomerQueries,
  UserInvites,
  Role,
  Plans,
} = require("../models");

const { QuickSightClient, UpdateUserCommand, ListUsersCommand, DeleteUserCommand } = require('@aws-sdk/client-quicksight');
const { CognitoIdentityClient, GetIdCommand, GetOpenIdTokenCommand } = require('@aws-sdk/client-cognito-identity');
const { STSClient, AssumeRoleWithWebIdentityCommand } = require('@aws-sdk/client-sts');


const cognitoClient = new CognitoIdentityClient({ region: "us-east-1" });
const stsClient = new STSClient({ region: "us-east-1" });


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
      let plan = null;
      if (company && company.plan_id) {
        plan = await Plans.findOne({ where: { id: company.plan_id } });
      }
      console.log(company, "company");

      let subscription = null;



      if (company) {
        subscription = await NewSubscriptions.findOne({
          where: { id: company.subscription_id },
        });
      }
      console.log(subscription, "subscription");
      const AdminRoleId = await Role.findOne({ where: { name: "ADMIN" } }).id;
      let isactive = null;
      if (subscription) {
        let hasActiveFlag = (
          subscription.status == "ACTIVE" &&
          (
            user.role_id == AdminRoleId ||
            user.is_invited == true
          )
        )
        if (hasActiveFlag) {
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
      /**
       * {
       * status: "success", // or "error"
       * message: "User fetched successfully",
       * data: [],
       * error: true, // or false
       * }
       */

      const userdata = { user, company, isactive, plan };
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

  async listInvitedUsers(req, res) {
    const { company_id, user_id } = req.query;
    if (!company_id || !user_id) {
      return res.status(400).json({
        success: false,
        message: "Company ID and user ID is required",
      });
    }
    try {
      // Fetch all invited users for the company
      const invitedUsers = await UserInvites.findAll({
        where: { company_id },
      });

      // Get admin users who are NOT in the invites table
      const adminUsers = await User.findAll({
        where: { company_id, role_id: 1 },
        attributes: ["Customer_Name", "email", "role_id", "image", "usertype"], // Fetch necessary attributes
      });

      // Filter out admin users already in the invited list
      const filteredAdminUsers = adminUsers.filter((adminUser) => {
        return !invitedUsers.some(
          (invitedUser) => invitedUser.email === adminUser.email
        );
      });

      // Convert invited users to JSON
      const invitedUsersData = invitedUsers.map((invite) => invite.toJSON());

      // Format user details
      const formattedUsers = await Promise.all(
        [...invitedUsersData, ...filteredAdminUsers].map(async (invite) => {
          if (invite.is_accepted) {
            // If it's an invited user who accepted the invite
            const userDetails = await User.findOne({
              where: {
                email: invite.email,
                is_varified: true,
              },
              attributes: [
                "Customer_Name",
                "email",
                "role_id",
                "image",
                "usertype",
              ],
            });
            return {
              id: invite.id || null,
              email: invite.email,
              invitedBy: invite.invitedBy || null,
              company_id: invite.company_id,
              is_accepted: invite.is_accepted || null,
              invited_at: invite.invited_at || null,
              created_at: invite.created_at || null,
              updated_at: invite.updated_at || null,
              deletedAt: invite.deletedAt || null,
              userDetails: userDetails || null,
            };
          }

          // If it's an admin, return their details directly
          if (invite.role_id === 1) {
            return {
              id: null,
              email: invite.email,
              invitedBy: null,
              company_id: company_id,
              is_accepted: null,
              invited_at: null,
              created_at: null,
              updated_at: null,
              deletedAt: null,
              userDetails: {
                Customer_Name: invite.Customer_Name,
                email: invite.email,
                role_id: invite.role_id,
                image: invite.image,
                usertype: invite.usertype,
              },
            };
          }

          return {
            id: invite.id || null,
            email: invite.email,
            invitedBy: invite.invitedBy || null,
            company_id: invite.company_id,
            is_accepted: invite.is_accepted || null,
            invited_at: invite.invited_at || null,
            created_at: invite.created_at || null,
            updated_at: invite.updated_at || null,
            deletedAt: invite.deletedAt || null,
            userDetails: null,
          };
        })
      );

      return res.json({
        success: true,
        invitedUsers: formattedUsers,
        message: "Invited users listed successfully",
      });
    } catch (error) {
      console.error("Error listing invited users:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to list invited users",
        error: error.message,
      });
    }
  },

  async InvitedUserAccess(req, res) {
    const { email, company_id, access_type } = req.body;
    try {
      const invitedUser = await UserInvites.findOne({ where: { email, company_id } });
      if (!invitedUser) {
        return res.status(404).json({
          message: "Invited user not found",
        });
      }
      if (access_type == "READER") {
        await invitedUser.update({ is_granted: true, role_id: 2 });
      } else if (access_type == "ADMIN") {
        await invitedUser.update({ is_granted: true, role_id: 1 });
      }
      return res.json({ success: true, message: "Access granted successfully" });
    } catch (error) {
      console.error("Error granting access to invited user:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to grant access to invited user",
        error: error.message,
      });
    }
  },

  async assumeRoleWithJWT(jwtToken, payloadSub) {
    console.log("Step 1: Fetching Cognito Identity ID...");
    const COGNITO_IDENTITY_POOL_ID = "us-east-1:3bed750a-a8a0-4866-b823-8f474cea8e6f";
    const IAM_ROLE_ARN = "arn:aws:iam::185329004895:role/amplify-amplifyquicksightdas-dev-dd445-authRole";
    const COGNITO_PROVIDER = "cognito-idp.us-east-1.amazonaws.com/us-east-1_O4uSMgJop";

    const idResponse = await cognitoClient.send(
      new GetIdCommand({
        IdentityPoolId: COGNITO_IDENTITY_POOL_ID,
        Logins: {
          [COGNITO_PROVIDER]: jwtToken,
        },
      })
    );
    console.log("Cognito Identity ID response:", idResponse);

    console.log("Step 2: Fetching OpenID Token...");
    const openIdTokenResponse = await cognitoClient.send(
      new GetOpenIdTokenCommand({
        IdentityId: idResponse.IdentityId,
        Logins: {
          [COGNITO_PROVIDER]: jwtToken,
        },
      })
    );
    console.log("OpenID Token response:", openIdTokenResponse);

    console.log("Step 3: Assuming IAM Role...");
    const stsResponse = await stsClient.send(
      new AssumeRoleWithWebIdentityCommand({
        RoleSessionName: payloadSub,
        WebIdentityToken: openIdTokenResponse.Token,
        RoleArn: IAM_ROLE_ARN,
      })
    );
    return stsResponse;
  },

  async DeActivateUserQs(req, res) {
    const { email, jwtToken, payloadSub } = req.query;
    const AWS_REGION = "us-east-1";
    const AWS_ACCOUNT_ID = "185329004895";
    if (!email) {
      return res.status(400).json({ error: 'Missing required parameter: email' });
    }

    try {
      // Assume role and get temporary credentials
      const stsResponse = await this.assumeRoleWithJWT(jwtToken, payloadSub);
      const quickSightClientWithCreds = new QuickSightClient({
        region: AWS_REGION,
        credentials: {
          accessKeyId: stsResponse.Credentials.AccessKeyId,
          secretAccessKey: stsResponse.Credentials.SecretAccessKey,
          sessionToken: stsResponse.Credentials.SessionToken,
        },
      });

      // Fetch the userName using the provided email
      const listUsersParams = {
        AwsAccountId: AWS_ACCOUNT_ID,
        Namespace: 'default',
      };

      const usersListResponse = await quickSightClientWithCreds.send(
        new ListUsersCommand(listUsersParams)
      );
      const users = usersListResponse.UserList;
      console.log("Users list:", users);
      const registeredUser = users.find(user => user.Email === email);

      if (!registeredUser) {
        return res.status(404).json({ error: 'User not found' });
      }
      console.log("Registered user:", registeredUser);
      if (registeredUser.Role == "AUTHOR_PRO") {
        return res.status(404).json({ error: 'Unauthorized to deactivate user' });
      }
      const userName = registeredUser.UserName;
      const params = {
        AwsAccountId: AWS_ACCOUNT_ID,
        Namespace: 'default',
        UserName: userName,
        Role: registeredUser.Role,
        Email: registeredUser.Email,
        Active: false, // Deactivates the user
      };
      console.log("Update user params:", params);
      const command = new UpdateUserCommand(params);
      console.log("Update user command:", command);
      const response = await quickSightClientWithCreds.send(command);
      console.log("Update user response:", response);
      res.status(200).json({ message: 'User deactivated successfully', data: response });
    } catch (error) {
      console.error('Error deactivating user:', error);
      res.status(500).json({ error: 'Failed to deactivate user', details: error.message });
    }
  },

  async DeleteUserQs(req, res) {
    const { email, jwtToken, payloadSub } = req.query;
    const AWS_REGION = "us-east-1";
    const AWS_ACCOUNT_ID = "185329004895";

    if (!email) {
      return res.status(400).json({ error: 'Missing required parameter: email' });
    }

    try {
      // Assume role and get temporary credentials
      const stsResponse = await this.assumeRoleWithJWT(jwtToken, payloadSub);
      const quickSightClientWithCreds = new QuickSightClient({
        region: AWS_REGION,
        credentials: {
          accessKeyId: stsResponse.Credentials.AccessKeyId,
          secretAccessKey: stsResponse.Credentials.SecretAccessKey,
          sessionToken: stsResponse.Credentials.SessionToken,
        },
      });

      // Fetch the userName using the provided email
      const listUsersParams = {
        AwsAccountId: AWS_ACCOUNT_ID,
        Namespace: 'default',
      };

      const usersListResponse = await quickSightClientWithCreds.send(
        new ListUsersCommand(listUsersParams)
      );
      const users = usersListResponse.UserList;
      console.log("Users list:", users);
      const registeredUser = users.find(user => user.Email === email);

      if (!registeredUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      console.log("Registered user:", registeredUser);

      const userName = registeredUser.UserName;
      const params = {
        AwsAccountId: AWS_ACCOUNT_ID,
        Namespace: 'default',
        UserName: userName,
        Email: registeredUser.Email,
        Role: registeredUser.Role,
      };

      console.log("Delete user params:", params);
      const command = new DeleteUserCommand(params);
      console.log("Delete user command:", command);

      const response = await quickSightClientWithCreds.send(command);
      console.log("Delete user response:", response);

      res.status(200).json({ message: 'User deleted successfully', data: response });

    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ error: 'Failed to delete user', details: error.message });
    }
  }



};

module.exports = UserController;

// Bank, Apple pay