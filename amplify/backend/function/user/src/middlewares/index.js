const awsServerlessExpressMiddleware = require("aws-serverless-express/middleware");
const conditionalAuthMiddleware = require("./conditional_auth.middleware");
const validateScheduleToken = require("./verifyScheduleToken.middleware");

module.exports = {
  conditionalAuthMiddleware,
  awsServerlessExpressMiddleware,
  validateScheduleToken,
};
// Changed