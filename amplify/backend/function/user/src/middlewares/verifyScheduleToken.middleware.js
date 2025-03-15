const crypto = require("crypto");

// Middleware to validate Bearer token
const validateScheduleToken =
  (
    options = {
      name: "daily_12am_trigger",
      cron: "0 0 * * ? *",
    }
  ) =>
    (req, res, next) => {
      try {
        // Expected payload for validation
        const payload = JSON.stringify({
          invokedBy: "Amazon EventBridge Scheduler",
          user: "firebeatsapp@gmail.com",
          ...options, // Merge with provided options
        });

        // Generate the expected token
        const base64EncodedPayload = Buffer.from(payload).toString("base64");
        const expectedToken = crypto
          .createHash("md5")
          .update(base64EncodedPayload)
          .digest("hex");

        // Extract Bearer token from headers
        const authHeader = req.headers["authorization"];
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
          return res
            .status(401)
            .json({ error: "Unauthorized: Bearer token missing or malformed" });
        }

        const bearerToken = authHeader.split(" ")[1];

        // Compare the tokens
        if (bearerToken !== expectedToken) {
          return res
            .status(401)
            .json({ error: "Unauthorized: Invalid Bearer token" });
        }

        // Token is valid, proceed to the next middleware/route
        next();
      } catch (error) {
        console.error("Error validating Bearer token:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    };

const generateToken = (options) => {
  const payload = JSON.stringify({
    invokedBy: "Amazon EventBridge Scheduler",
    user: "firebeatsapp@gmail.com",
    ...options, // Merge with provided options
  });
  const base64EncodedPayload = Buffer.from(payload).toString("base64");
  return crypto.createHash("md5").update(base64EncodedPayload).digest("hex");
  // return Buffer.from(payload).toString("base64");
};
/*
console.log(
  generateToken({
    name: "daily_12am_trigger",
    cron: "0 0 * * ? *",
  })
);// a49a0310055b7957ca996eed3293d369
*/
/*
console.log(
  generateToken({
    name: "every_minute_trigger",
    cron: "0/1 * * * ? *",
  })
);// 39cff1248db2d00f678fb4421fc24813
*/
module.exports = { validateScheduleToken, generateToken };
// Changed