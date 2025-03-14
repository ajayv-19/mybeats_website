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
        const { inviteId } = req.body;
        const invite = await UserInvites.findByPk(inviteId);
        if (!invite) {
            return res.status(400).json({ message: "Invite not found" });
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

    async syncMyInvites(req, res, { in_call = false }) {
        const user = req.user;
        const AdminRoleId = await Role.findOne({ where: { name: "ADMIN" } }).id;
        const adminUsers = await User.findAll({ where: { company_id: user.company_id, role_id: AdminRoleId } });
        const invites = await UserInvites.findAll({ where: { company_id: user.company_id } });
        const acceptedInvites = invites.filter((invite) => invite.is_accepted);
        // remove admin from invites list
        const invitesWithoutAdmin = invites.filter((invite) => adminUsers.every((adminUser) => adminUser.email !== invite.email));
        // const acceptedInvitesWithoutAdmin = invitesWithoutAdmin.filter((invite) => invite.is_accepted);
        const company = await Company.findByPk(user.company_id);
        await company.update({
            number_of_admins: adminUsers.length,
            number_of_users_invited: invites.length,
            number_of_users_accepted: acceptedInvites.length,
            license_used: invitesWithoutAdmin.length + adminUsers.length
        });
        if (!in_call) {
            return res.status(200).json({ message: "Invites synced successfully" });
        } else {
            return true;
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
                invited_by: req.user.id

            });
        }
        const { replacements, subject } = this.getTemplateAttributes(templateName);
        replacements["inviteUrl"] = APP_URL + `/invite?invite_id=${invite.id}`;
        const emailService = new EmailService();
        emailService
            .sendTemplateEmail(to, subject, templateName, replacements)
            .then(() => {
                this.syncMyInvites(req, res, { in_call: true }).then(() => {
                    res.status(200).json({ message: "Email sent successfully" })
                }).catch((error) => {
                    res.status(500).json({ message: "Failed to sync invites", error })
                });
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
