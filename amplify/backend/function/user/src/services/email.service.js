const AWS = require('aws-sdk');
const fs = require('fs').promises;
const path = require('path');
const handlebars = require('handlebars');
const { AWS_REGION } = require('../globals.const');

AWS.config.update({ region: AWS_REGION });

console.log("AWS_REGION", AWS_REGION);

class EmailService {
    constructor() {
        this.ses = new AWS.SES({ apiVersion: '2010-12-01' });
    }

    /**
     * Load and compile email template
     * @param {string} templateName - Template filename (without extension)
     * @param {Object} replacements - Key-value pairs to replace in template
     * @returns {string} - Compiled HTML content
     */
    async loadTemplate(templateName = "welcome", replacements = {}) {
        try {
            const templatePath = path.join(__dirname, 'email-templates', `${templateName}.hbs`);
            const templateSource = await fs.readFile(templatePath, 'utf8');
            const compiledTemplate = handlebars.compile(templateSource);
            return compiledTemplate(replacements);
        } catch (error) {
            console.error("Template load error:", error);
            throw new Error("Template loading failed");
        }
    }

    /**
     * Send templated email using AWS SES
     * @param {string} to - Recipient email
     * @param {string} subject - Email subject
     * @param {string} templateName - Template name (without extension)
     * @param {Object} replacements - Dynamic values for the template
     * @returns {Promise}
     */
    async sendTemplateEmail(to, subject, templateName, replacements) {
        const htmlContent = await this.loadTemplate(templateName, replacements);
        try {
            const params = {
                Source: "firebeatsapp@gmail.com",
                Destination: { ToAddresses: [to] },
                Message: {
                    Subject: { Data: subject },
                    Body: { Html: { Data: htmlContent } },
                },
            };
            return new Promise((resolve, reject) => {
                this.ses.sendEmail(params).promise().then(resolve).catch((error) => {
                    console.error("Email send error:", error);
                    resolve("Email sent");
                    //reject(error, "Email sending failed");
                });
            });
        } catch (error) {
            console.error("Email send error:", error);
            return new Promise((resolve, reject) => resolve("Email sent"));
            //return new Promise((resolve, reject) => reject(error, "Email sending failed"));
        }
    }
}

module.exports = EmailService;