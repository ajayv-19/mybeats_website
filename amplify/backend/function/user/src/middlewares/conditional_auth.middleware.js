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
    res.status(401).json({ message: "Unauthorized" });
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
    `${API_PREFIX}/agentform/update`
  ];
  console.log({ currentPath: req.path, bypassRoutes });
  if (bypassRoutes.includes(req.path)) {
    // Skip AWS Serverless Middleware for these routes
    return next();
  }
  const cuser = await validateUser(req, res, next);
  cuser.username = cuser.username || cuser["cognito:username"];
  const user = await User.findOne({ where: { username: cuser.username } });
  const hasUser = !!user || !!cuser;
  console.log({ user, cuser, hasUser });
  if (hasUser) {
    req.isAuthenticated = true;
    req.user = user;
    req.cognitoUser = cuser;
  } else return res.status(401).json({ message: "Unauthorized" });
  next();
  // Apply AWS Serverless Middleware for all other routes
};

module.exports = conditionalAuthMiddleware;
// Changed