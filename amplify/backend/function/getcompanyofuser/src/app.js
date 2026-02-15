/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/

const { Client } = require("pg");
const {
  STSClient,
  AssumeRoleWithWebIdentityCommand,
} = require("@aws-sdk/client-sts");
const {
  CognitoIdentityClient,
  GetIdCommand,
  GetOpenIdTokenCommand,
} = require("@aws-sdk/client-cognito-identity");

const express = require("express");
const bodyParser = require("body-parser");
const awsServerlessExpressMiddleware = require("aws-serverless-express/middleware");

// declare a new express app
const app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

// Enable CORS for all methods
// app.use("/company", function (req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept"
//   );
//   next();
// });

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
/**********************
 * Example get method *
 **********************/

// PostgreSQL client configuration connection
const client = new Client({
  connectionString:
    "postgres://u7de1gksepndnt:p1c2333014360621da7529c12e4913683745a2a7fbbd989c81b27cdcd6ff192bb@cc01ok1186700o.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com:5432/de4endh728bucn",
  ssl: {
    rejectUnauthorized: false,
  },
});

client.connect();

app.get("/getcompanybyemail", async function (req, res) {
  // Extract email from the request query
  const email = req.query["email"];

  // Validate if email is provided
  if (!email) {
    return res
      .status(400)
      .json({ message: "Missing 'email' parameter in request" });
  }

  try {
    // Define the SQL query to select all fields from "public"."RLS" table where the email matches
    const queryText = `
      SELECT * 
      FROM "public"."RLS" 
      WHERE email = $1
    `;

    // Execute the query and store the result
    const result = await client.query(queryText, [email]);

    // Check if any rows are returned in the result
    if (result.rows.length > 0) {
      // If a match is found, respond with all user information
      const userData = result.rows[0];
      res
        .status(200)
        .json({ data: userData, message: "User found successfully" });
    } else {
      // If no match is found, respond with a 404 status and informative message
      res.status(404).json({ message: "No user found for the provided email" });
    }
  } catch (error) {
    // Log the error for debugging purposes
    console.error("Error querying the database:", error);

    // Respond with a 500 status and the error message to indicate server-side issues
    res
      .status(500)
      .json({ message: "Internal server error", details: error.message });
  }
});

// app.get("/fetch", async function (req, res) {
//   // Add your code here
//   const email = req.query["email"];
//   res.json({ success: "get call succeed!", url: req.url, email });
// });

// app.get("/getcompanybyemail/*", function (req, res) {
//   // Add your code here
//   res.json({ success: "get call succeeed!", url: req.url });
// });

/****************************
 * Example post method *
 ****************************/

app.post("/adduser", function (req, res) {
  // Add your code here
  res.json({ success: "post call succeed!", url: req.url, body: req.body });
});

// app.post("/getcompanybyemail/*", function (req, res) {
//   // Add your code here
//   res.json({ success: "post call succeed!", url: req.url, body: req.body });
// });

/****************************
 * Example put method *
 ****************************/

app.put("/getcompanybyemail", function (req, res) {
  // Add your code here
  res.json({ success: "put call succeed!", url: req.url, body: req.body });
});

// app.put("/getcompanybyemail/*", function (req, res) {
//   // Add your code here
//   res.json({ success: "put call succeed!", url: req.url, body: req.body });
// });

/****************************
 * Example delete method *
 ****************************/

app.delete("/getcompanybyemail", function (req, res) {
  // Add your code here
  res.json({ success: "delete call succeed!", url: req.url });
});

// app.delete("/getcompanybyemail/*", function (req, res) {
//   // Add your code here
//   res.json({ success: "delete call succeed!", url: req.url });
// });

app.listen(3000, function () {
  console.log("App started");
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app;
