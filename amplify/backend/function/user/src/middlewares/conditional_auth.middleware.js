const jwt = require("jsonwebtoken");
const jwksClient = require("jwks-rsa");
//const jwt = [];
const awsServerlessExpressMiddleware = require("aws-serverless-express/middleware");
const {
  API_URL,
  API_PREFIX,
  COGNITO_JWT_JSON,
  COGNITO_ISSUER,
} = require("../globals.const");
const { User } = require("../models");
const client = jwksClient({
  jwksUri: COGNITO_JWT_JSON,
});

const validateUser = async (req, res) => {
  try {
    console.log({ headers: req.headers, client });
    const token = req.headers.authorization; // Extract the Bearer token
    console.log({ token });
    if (!token) throw new Error("No token provided");

    const decodedToken = jwt.decode(token, { complete: true });
    console.log({ decodedToken });
    if (!decodedToken || !decodedToken.header || !decodedToken.header.kid) {
      throw new Error("Invalid token");
    }

    const key = await client.getSigningKey(decodedToken.header.kid);
    const signingKey = key.getPublicKey();
    console.log({ signingKey, COGNITO_JWT_JSON, COGNITO_ISSUER });

    return jwt.verify(token, signingKey, {
      issuer: COGNITO_ISSUER,
      algorithms: ["RS256"],
    });
  } catch (error) {
    console.error("Authorization failed:", error);
    res.status(401).json({ message: "Unauthorized", error: error.message });
    return null; // Return null to indicate failure
  }
};

const conditionalAuthMiddleware = async (req, res, next) => {
  //awsServerlessExpressMiddleware.eventContext()(req, res, next);
  const bypassRoutes = [
    `${API_PREFIX}/payment-success`,
    `${API_PREFIX}/payment-cancel`,
    `${API_PREFIX}/daily-schedule`,
    `${API_PREFIX}/create-subscription`,
    `${API_PREFIX}/webhook`,
    `${API_PREFIX}/addcomment`,
    `${API_PREFIX}/agentform/submit`,
    `${API_PREFIX}/agentform/update`,
    `${API_PREFIX}/agentform/mark-submitted`,
  ];
  
  // Allow broker forms to fetch form data without auth (read-only GET requests)
  // Broker forms are embedded in iframes and don't have access to carrier auth tokens
  const isBrokerFormReadRequest = 
    req.method === 'GET' && 
    req.path.match(new RegExp(`^${API_PREFIX}/agentform/\\d+$`)); // Matches /backendapi/agentform/:formId
  
  // Allow broker forms to fetch fire departments list without auth (read-only GET requests)
  const isFireDepartmentsReadRequest = 
    req.method === 'GET' && 
    req.path === `${API_PREFIX}/fire-departments`; // Matches /backendapi/fire-departments
  
  // Allow broker forms to fetch attachments without auth (read-only GET requests)
  const isAttachmentsReadRequest = 
    req.method === 'GET' && 
    (req.path.match(new RegExp(`^${API_PREFIX}/agentform/\\d+/attachments$`)) || // Matches /backendapi/agentform/:formId/attachments
     req.path.match(new RegExp(`^${API_PREFIX}/attachments/\\d+$`))); // Matches /backendapi/attachments/:formId (alias for broker compatibility)

  // Allow broker forms to fetch the single fire department linked to a form without auth
  const isFireDepartmentForFormReadRequest =
    req.method === 'GET' &&
    req.path.match(new RegExp(`^${API_PREFIX}/agentform/\\d+/fire-department$`));

  console.log({ currentPath: req.path, method: req.method, bypassRoutes, isBrokerFormReadRequest, isFireDepartmentsReadRequest, isAttachmentsReadRequest, isFireDepartmentForFormReadRequest });

  if (
    bypassRoutes.includes(req.path) ||
    isBrokerFormReadRequest ||
    isFireDepartmentsReadRequest ||
    isAttachmentsReadRequest ||
    isFireDepartmentForFormReadRequest
  ) {
    // Skip authentication for these routes
    return next();
  }
  
  try {
    const cuser = await validateUser(req, res, next);
    
    // If validateUser returned null, it already sent a 401 response
    if (!cuser) {
      return; // Stop processing, response already sent
    }
    
    cuser.username = cuser.username || cuser["cognito:username"];
    const user = await User.findOne({ where: { username: cuser.username } });
    const hasUser = !!user || !!cuser;
    console.log({ user, cuser, hasUser });
    
    if (hasUser) {
      req.isAuthenticated = true;
      req.user = user;
      req.cognitoUser = cuser;
      next();
    } else {
      return res.status(401).json({ message: "Unauthorized", error: "User not found" });
    }
  } catch (error) {
    console.error("Error in conditionalAuthMiddleware:", error);
    return res.status(500).json({ 
      message: "Internal server error", 
      error: error.message || "Authentication middleware error" 
    });
  }
  // Apply AWS Serverless Middleware for all other routes
};

module.exports = conditionalAuthMiddleware;
// Changed