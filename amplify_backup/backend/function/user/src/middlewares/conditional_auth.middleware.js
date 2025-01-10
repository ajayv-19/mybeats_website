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
  ];
  console.log({ currentPath: req.path, bypassRoutes });
  if (bypassRoutes.includes(req.path)) {
    // Skip AWS Serverless Middleware for these routes
    return next();
  }
  const user = await validateUser(req, res, next);
  if (user) req.user = user;
  else return res.status(401).json({ message: "Unauthorized" });
  next();
  // Apply AWS Serverless Middleware for all other routes
};

module.exports = conditionalAuthMiddleware;
