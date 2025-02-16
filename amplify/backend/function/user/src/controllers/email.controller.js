const { console } = require("inspector");
const { APP_URL } = require("../globals.const");
const { Company, User, NewSubscriptions, UserInvites } = require("../models");
const EmailService = require("../services/email.service");
class EmailController {
    request = null;
    setupRoutes(app) {
        app.post("/email/send", (req, res) => this.sendEmail(req, res));
        app.post("/email/invite", (req, res) => this.invite(req, res));
    }

    invite(req, res) {
        this.request = req;
        if (!req.isAuthenticated) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const { to, templateName = "invite" } = req.body;
        let invite = UserInvites.findOne({ where: { email: to } });
        if (!invite) {
            invite = UserInvites.create({
                email: to,
                invitedBy: req.user.id,
                company_id: req.user.company_id,
            });
        }
        const { replacements, subject } = this.getTemplateAttributes(templateName);
        replacements["inviteUrl"] = APP_URL + `/invite?invite_id=${invite.id}`;
        const emailService = new EmailService();
        emailService
            .sendTemplateEmail(to, subject, templateName, replacements)
            .then(() => res.status(200).json({ message: "Email sent successfully" }))
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
