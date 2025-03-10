const { console } = require("inspector");
const { APP_URL } = require("../globals.const");
const { Company, User, NewSubscriptions, UserInvites, Plans, Role } = require("../models");
const EmailService = require("../services/email.service");
const { update } = require("lodash");
class EmailController {
    request = null;
    setupRoutes(app) {
        app.post("/email/send", (req, res) => this.sendEmail(req, res));
        app.post("/email/invite", (req, res) => this.invite(req, res));
        // app.post("/email/invite/accept", (req, res) => this.acceptInvite(req, res));
        app.post("/email/invite/cancel", (req, res) => this.cancelInvite(req, res));
    }

    async cancelInvite(req, res) {
        const { emailId } = req.body;
        //const invite = await UserInvites.findByPk(inviteId);
        const invite = await UserInvites.findOne({ where: { email: emailId } });

        if (!invite) {

            const user = await User.findOne({ where: { email: emailId } });
            if (user) {
                await user.update({
                    is_invited: false,
                    invited_by: 0,
                    role_id: 3
                });
                return res.status(200).json({ message: "Invite of Admin cancelled successfully" });
            }
            return res.status(400).json({ message: "Invite not found" });
        }

        const user = await User.findOne({ where: { email: invite.email } });
        if (user) {
            await user.update({


                is_invited: false,
                invited_by: 0,
                role_id: 3


            });
        }
        await invite.destroy(); // Soft delete
        await this.syncMyInvites(req, res, { in_call: true });
        return res.status(200).json({ message: "Invite cancelled successfully" });
    }

    async hasInviteLimit(req, res, { in_call = false }) {
        const user = req.user;
        const company = await Company.findByPk(user.company_id);
        const plan = await Plans.findByPk(company.plan_id);
        // const invites = await UserInvites.count({ where: { company_id: user.company_id } });
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
    }

    // async syncMyInvites(req, res, { in_call = false }) {
    //     console.log("Syncing invites");
    //     try {


    //     const user = req.user;
    //     const AdminRoleId = Role.findOne({ where: { name: "ADMIN" } }).id;
    //     const adminUsers = await User.findAll({ where: { company_id: user.company_id, role_id: AdminRoleId } });
    //     const invites = await UserInvites.findAll({ where: { company_id: user.company_id } });
    //     const acceptedInvites = invites.filter((invite) => invite.is_accepted);
    //     // remove admin from invites list
    //     const invitesWithoutAdmin = invites.filter((invite) => invite.email !== user.email);
    //     const acceptedInvitesWithoutAdmin = invitesWithoutAdmin.filter((invite) => invite.is_accepted);
    //     const company = await Company.findByPk(user.company_id);
    //     console.log("company", company);
    //     await company.update({
    //         number_of_admins: adminUsers.length,
    //         number_of_users_invited: invites.length,
    //         number_of_users_accepted: acceptedInvites.length,
    //         license_used: acceptedInvitesWithoutAdmin.length + adminUsers.length
    //     });
    //     console.log("Company updated successfully");
    //     if (!in_call) {
    //         console.log("Not in call");
    //         return res.status(200).json({ message: "Invites synced successfully" });
    //     } else {
    //         console.log("In call");
    //         return true;
    //     }
    //     } catch (error) {
    //         console.log("error", error);
    //         return true;
    //         //return res.status(500).json({ message: "Something went wrong", error });
    //     }
    // }

    async syncMyInvites(req, res, { in_call = false }) {
        console.log("Syncing invites");
        try {
            const user = req.user;

            // Fix the Role query
            const adminRole = await Role.findOne({ where: { name: "ADMIN" } });
            if (!adminRole) {
                throw new Error("Admin role not found");
            }

            const adminUsers = await User.findAll({
                where: {
                    company_id: user.company_id,
                    role_id: adminRole.id
                }
            });

            const invites = await UserInvites.findAll({
                where: { company_id: user.company_id }
            });

            const acceptedInvites = invites.filter((invite) => invite.is_accepted);
            const invitesWithoutAdmin = invites.filter((invite) => invite.email !== user.email);
            const acceptedInvitesWithoutAdmin = invitesWithoutAdmin.filter((invite) => invite.is_accepted);

            const company = await Company.findByPk(user.company_id);
            if (!company) {
                throw new Error("Company not found");
            }

            await company.update({
                number_of_admins: adminUsers.length,
                number_of_users_invited: invites.length,
                number_of_users_accepted: acceptedInvites.length,
                license_used: acceptedInvitesWithoutAdmin.length + adminUsers.length
            });

            return in_call ? true : res.status(200).json({ message: "Invites synced successfully" });
        } catch (error) {
            console.error("Sync invites error:", error);
            if (in_call) {
                throw error; // Propagate error when called from other functions
            }
            return res.status(500).json({ message: "Failed to sync invites", error: error.message });
        }
    }

    async invite(req, res) {
        this.request = req;
        if (!req.isAuthenticated) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (!await this.hasInviteLimit(req, res, { in_call: true })) {
            return res.status(400).json({ message: "Invite limit reached" });
        }
        const { to, templateName = "invite" } = req.body;
        // let loogedInUser = req.user;
        // console.log(loogedInUser,"loogedInUser");
        // let role = loogedInUser.getRole();
        // console.log(role,"role");
        // if (role.name.toLowerCase() !== "admin") {
        //     return res.status(401).json({ message: "Unauthorized" });
        // }
        let invite = await UserInvites.findOne({ where: { email: to } });
        if (!invite) {
            invite = await UserInvites.create({
                email: to,
                invitedBy: req.user.id,
                company_id: req.user.company_id,
                is_accepted: false,
                created_at: new Date()
            });
        }
        const user = await User.findOne({ where: { email: to } });
        if (user) {
            await invite.update({
                is_accepted: true,
                updated_at: new Date()
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
        console.log("email service instance", emailService);
        emailService
            .sendTemplateEmail(to, subject, templateName, replacements)
            .then(() => {
                try {
                    ///*
                    this.syncMyInvites(req, res, { in_call: true }).then(() => {
                        res.status(200).json({ message: "Email sent successfully OG" })
                    }).catch((error) => {
                        true
                        console.log("error", error);
                        //res.status(500).json({ message: "Failed to sync invites", error });
                        res.status(200).json({ message: "Email sent successfully catch" });
                    });
                    //*/
                } catch (error) {
                    console.log("error", error);
                    res.status(200).json({ message: "Email sent successfully try catch" });
                }

            })
            .catch((error) =>
                res.status(500).json({ message: "Failed to send email", error })
            );
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
            .catch((error) =>
                res.status(500).json({ message: "Failed to send email", error })
            );
    }

    getTemplateReplacements(templateName) {
        console.log("getTemplateReplacements", { templateName, user: this.request.user });
        switch (templateName) {
            case "welcome":
                return { name: this.request.name, email: this.request.email, debug: JSON.stringify(this.request.user) };
            case "invite":
                return { name: this.request.name, email: this.request.email };
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
        }
    }
}

module.exports = new EmailController();
