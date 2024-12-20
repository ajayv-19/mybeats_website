const awsServerlessExpressMiddleware = require("aws-serverless-express/middleware");
const conditionalAuthMiddleware = require("./conditional_auth.middleware");

module.exports = { conditionalAuthMiddleware, awsServerlessExpressMiddleware };
