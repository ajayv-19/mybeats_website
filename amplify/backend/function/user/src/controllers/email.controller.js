const { APP_URL } = require("../globals.const");
const { Company, User, NewSubscriptions, UserInvites, Plans, Role } = require("../models");
const EmailService = require("../services/email.service");

class EmailController {
    request = null;

    setupRoutes(app) {
        app.post("/email/send", (req, res) => this.sendEmail(req, res));
        app.post("/email/invite", (req, res) => this.invite(req, res));
        app.post("/email/invite/cancel", (req, res) => this.cancelInvite(req, res));
    }

    async cancelInvite(req, res) {
        const { emailId } = req.body;

        try {
            // Check if the email exists in the UserInvites table
            const invite = await UserInvites.findOne({ where: { email: emailId } });

            if (invite) {
                // Check if the invite's email exists in the User table
                const userRecord = await User.findOne({ where: { email: emailId } });

                if (userRecord) {
                    // Update the user's role to READER (role_id = 3) and mark is_invited as false
                    await userRecord.update({
                        role_id: 3, // Set role to READER
                        is_invited: false, // Mark as not invited
                    });
                }

                // Destroy the invite after updating the user record
                await invite.destroy();
            } else {
                // If not found in UserInvites, check in the User table
                const user = await User.findOne({ where: { email: emailId } });

                if (!user) {
                    return res.status(400).json({ message: "Email not found in UserInvites or User table" });
                }

                // Update the user's role to READER (role_id = 3) and mark is_invited as false
                await user.update({
                    role_id: 3, // Set role to READER
                    is_invited: false, // Mark as not invited
                });
            }

            // Call syncMyInvites after the operation
            await this.syncMyInvites(req, res, { in_call: true });

            return res.status(200).json({ message: "Invite cancelled successfully" });
        } catch (error) {
            console.error("Error in cancelInvite:", error);
            return res.status(500).json({ message: "Failed to cancel invite", error });
        }
    }

    async hasInviteLimit(req, res, { in_call = false }) {
        try {
            const user = req.user;
            const company = await Company.findByPk(user.company_id);
            const plan = await Plans.findByPk(company.plan_id);

            let message = "";
            let proceedFlag = false;

            if (!plan) {
                message = "Plan not found";
            } else if (plan.team_size <= company.license_used) {
                message = "Invite limit reached";
            } else {
                proceedFlag = true;
                message = "Invite limit not reached";
            }

            if (!in_call) {
                return res.status(200).json({ message, proceedFlag });
            } else {
                return proceedFlag;
            }
        } catch (error) {
            console.error("Error in hasInviteLimit:", error);
            if (!in_call) {
                return res.status(500).json({ message: "Failed to check invite limit", error });
            } else {
                throw error;
            }
        }
    }

    async syncMyInvites(req, res, { in_call = false }) {
        try {
            const user = req.user;

            const adminRole = await Role.findOne({ where: { name: "ADMIN" } });
            if (!adminRole) {
                throw new Error("Admin role not found");
            }

            const adminUsers = await User.findAll({ where: { company_id: user.company_id, role_id: adminRole.id } });
            const invites = await UserInvites.findAll({ where: { company_id: user.company_id } });
            const acceptedInvites = invites.filter((invite) => invite.is_accepted);

            // Remove admin from invites list
            const invitesWithoutAdmin = invites.filter((invite) =>
                adminUsers.every((adminUser) => adminUser.email !== invite.email)
            );

            const company = await Company.findByPk(user.company_id);
            if (!company) {
                throw new Error("Company not found");
            }

            await company.update({
                number_of_admins: adminUsers.length,
                number_of_users_invited: invites.length,
                number_of_users_accepted: acceptedInvites.length,
                license_used: invitesWithoutAdmin.length + adminUsers.length,
            });

            if (!in_call) {
                return res.status(200).json({ message: "Invites synced successfully" });
            } else {
                return true;
            }
        } catch (error) {
            console.error("Error in syncMyInvites:", error);
            if (!in_call) {
                return res.status(500).json({ message: "Failed to sync invites", error });
            } else {
                throw error;
            }
        }
    }

    async invite(req, res) {
        this.request = req;

        if (!req.isAuthenticated) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        try {
            const inviteLimitReached = await this.hasInviteLimit(req, res, { in_call: true });
            if (!inviteLimitReached) {
                return res.status(400).json({ message: "Invite limit reached" });
            }

            const { to, templateName = "invite" } = req.body;

            let invite = await UserInvites.findOne({ where: { email: to } });
            if (!invite) {
                invite = await UserInvites.create({
                    email: to,
                    invitedBy: req.user.id,
                    company_id: req.user.company_id,
                    is_accepted: false,
                    created_at: new Date(),
                });
            }

            const user = await User.findOne({ where: { email: to } });
            if (user) {
                await invite.update({
                    is_accepted: true,
                    updated_at: new Date(),
                });
                await user.update({
                    company_id: req.user.company_id,
                    is_varified: true,
                    is_invited: true,
                    invited_by: req.user.id,
                    role_id: 2
                });
            }

            const { replacements, subject } = this.getTemplateAttributes(templateName);
            replacements["inviteUrl"] = APP_URL + `/invite?invite_id=${invite.id}`;

            const emailService = new EmailService();
            await emailService.sendTemplateEmail(to, subject, templateName, replacements);

            await this.syncMyInvites(req, res, { in_call: true });

            return res.status(200).json({ message: "Email sent successfully" });
        } catch (error) {
            console.error("Error in invite:", error);
            return res.status(500).json({ message: "Failed to send invite", error });
        }
    }

    sendEmail(req, res) {
        this.request = req;

        if (!req.isAuthenticated) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { to, templateName = "welcome" } = req.body;
        const { replacements, subject } = this.getTemplateAttributes(templateName);

        const emailService = new EmailService();
        emailService
            .sendTemplateEmail(to, subject, templateName, replacements)
            .then(() => res.status(200).json({ message: "Email sent successfully" }))
            .catch((error) => {
                console.error("Error in sendEmail:", error);
                res.status(500).json({ message: "Failed to send email", error });
            });
    }

    getTemplateReplacements(templateName) {
        console.log("getTemplateReplacements", { templateName, user: this.request.user });
        //get company name from company id
        // const company = Company.findByPk(this.request.user.company_id);
        const company = "My Beats";
        console.log("company", company);
        switch (templateName) {
            case "welcome":
                return {
                    name: this.request.Customer_Name,
                    email: this.request.email,
                    debug: JSON.stringify(this.request.user)
                };
            case "invite":
                return { name: this.request.user.Customer_Name, email: this.request.email, company: company.Company_Name };
            default:
                return {};
        }
    }

    getTemplateSubject(templateName) {
        switch (templateName) {
            case "welcome":
                return "Welcome to our platform";
            case "invite":
                return "You have been invited to join our platform";
            default:
                return "No subject";
        }
    }

    getTemplateAttributes(templateName) {
        return {
            subject: this.getTemplateSubject(templateName),
            replacements: this.getTemplateReplacements(templateName),
        };
    }
}

module.exports = new EmailController();

// Changed