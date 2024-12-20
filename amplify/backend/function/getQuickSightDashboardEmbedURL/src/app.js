const {
  QuickSightClient,
  RegisterUserCommand,
  GetDashboardEmbedUrlCommand,
  ListUsersCommand,
} = require("@aws-sdk/client-quicksight");
const {
  STSClient,
  AssumeRoleWithWebIdentityCommand,
} = require("@aws-sdk/client-sts");
const {
  CognitoIdentityClient,
  GetIdCommand,
  GetOpenIdTokenCommand,
} = require("@aws-sdk/client-cognito-identity");
const { Client } = require("pg");

var express = require("express");
var bodyParser = require("body-parser");
var awsServerlessExpressMiddleware = require("aws-serverless-express/middleware");

// declare a new express app
var app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

// Enable CORS for all methods
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// PostgreSQL client configuration connection
const client = new Client({
  connectionString:
    "postgres://u7de1gksepndnt:pc9cf448765b86e4e33da258b19cb59a9c52c61efcea2fa686a2cd24170ef2bd0@c3gtj1dt5vh48j.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com:5432/d4cndihsitnn9n",
  ssl: {
    rejectUnauthorized: false,
  },
});

client.connect();

// Function to extract domain from email
function getDomainFromEmail(email) {
  const domain = email.split("@")[1];
  return domain;
}

app.get("/getQuickSightDashboardEmbedURL", async function (req, res) {
  const { email, jwtToken, payloadSub } = req.query;

  console.log("req query ");
  console.log(req.query);
  console.log("payloadSub ");
  console.log(payloadSub);

  const roleArn =
    "arn:aws:iam::185329004895:role/amplify-amplifyquicksightdas-dev-dd445-authRole";
  const region = "us-east-1";
  const sessionName = payloadSub;

  console.log("Received JWT Token:", jwtToken);
  console.log("Received payloadSub (sessionName):", sessionName);
  console.log("Received email:", email);

  const cognitoClient = new CognitoIdentityClient({ region });
  const stsClient = new STSClient({ region });
  const quickSightClient = new QuickSightClient({ region });

  try {
    // Step 1: Get Cognito Identity ID
    const getIdParams = {
      IdentityPoolId: "us-east-1:3bed750a-a8a0-4866-b823-8f474cea8e6f",
      Logins: {
        "cognito-idp.us-east-1.amazonaws.com/us-east-1_O4uSMgJop": jwtToken,
      },
    };

    console.log("Calling GetIdCommand with params:", getIdParams);

    const idResponse = await cognitoClient.send(new GetIdCommand(getIdParams));
    console.log("Cognito Identity ID response:", idResponse);

    // Step 2: Get OpenID Token
    const openIdTokenResponse = await cognitoClient.send(
      new GetOpenIdTokenCommand({
        IdentityId: idResponse.IdentityId,
        Logins: {
          "cognito-idp.us-east-1.amazonaws.com/us-east-1_O4uSMgJop": jwtToken,
        },
      })
    );

    console.log("OpenID Token response:", openIdTokenResponse);

    // Step 3: Assume Role with Web Identity
    const stsParams = {
      RoleSessionName: sessionName,
      WebIdentityToken: openIdTokenResponse.Token,
      RoleArn: roleArn,
    };

    console.log(
      "Calling AssumeRoleWithWebIdentityCommand with params:",
      stsParams
    );

    const stsResponse = await stsClient.send(
      new AssumeRoleWithWebIdentityCommand(stsParams)
    );
    console.log("STS Assume Role response:", stsResponse);

    const quickSightClientWithCreds = new QuickSightClient({
      region,
      credentials: {
        accessKeyId: stsResponse.Credentials.AccessKeyId,
        secretAccessKey: stsResponse.Credentials.SecretAccessKey,
        sessionToken: stsResponse.Credentials.SessionToken,
      },
    });

    // Step 4: Register User in QuickSight
    const registerUserParams = {
      AwsAccountId: "185329004895",
      Email: email,
      IdentityType: "IAM",
      Namespace: "default", // Ensure you're using the correct namespace
      UserRole: "READER",
      IamArn: roleArn,
      SessionName: sessionName,
    };

    console.log("Calling RegisterUserCommand with params:", registerUserParams);

    try {
      await quickSightClientWithCreds.send(
        new RegisterUserCommand(registerUserParams)
      );
      console.log("User registered successfully");
    } catch (err) {
      if (err.name === "ResourceExistsException") {
        console.log("User already exists");
      } else {
        console.log("Error registering user:", err);
        throw err;
      }
    }

    // Step 5: List Users to Get Generated UserName for the Email
    const listUsersParams = {
      AwsAccountId: "185329004895",
      Namespace: "default",
    };

    console.log("Calling ListUsersCommand with params:", listUsersParams);

    let userName;
    try {
      const usersListResponse = await quickSightClientWithCreds.send(
        new ListUsersCommand(listUsersParams)
      );
      const users = usersListResponse.UserList;

      // Find the user by email in the list
      const registeredUser = users.find((user) => user.Email === email);
      if (registeredUser) {
        userName = registeredUser.UserName;
        console.log("Retrieved UserName:", userName);
      } else {
        console.error(
          `User with email ${email} not found in QuickSight user list`
        );
      }
    } catch (err) {
      console.error("Error listing users in QuickSight:", err);
    }

    // Step 6: Save UserName to PostgreSQL (public.RLS table)
    if (userName) {
      const queryText =
        'INSERT INTO "public"."RLS"("email", "username", "role_id", "Company_Name") VALUES($1, $2, $3, $4) ON CONFLICT ("email") DO UPDATE SET "username" = EXCLUDED."username", "role_id" = EXCLUDED."role_id", "Company_Name" = EXCLUDED."Company_Name";';
      const domain = getDomainFromEmail(email);
      let company;

      try {
        // Fetch company from PostgreSQL based on domain
        const selectQuery =
          'SELECT company FROM "public"."Domain_companies" WHERE domain = $1';
        const selectResult = await client.query(selectQuery, [domain]);

        if (selectResult.rows.length > 0) {
          company = selectResult.rows[0].company;
          console.log(`Fetched company: ${company}`);
        } else {
          console.error(`No company found for domain: ${domain}`);
          company = null;
        }
      } catch (dbError) {
        console.error("Error interacting with PostgreSQL database:", dbError);
        company = null;
      }

      const values = [email, userName, 2, company];

      try {
        await client.query(queryText, values);

        // Step 7: Add data to Row_level_security table
        const rlsInsertQuery =
          'INSERT INTO "public"."Row_level_security"("Company Name", "username") VALUES($1, $2) ON CONFLICT ("username") DO NOTHING;';
        const rlsValues = [company, userName];
        try {
          await client.query(rlsInsertQuery, rlsValues);
          console.log("User information saved to Row_level_security table");
        } catch (dbError) {
          console.error(
            "Error saving user to Row_level_security table:",
            dbError
          );
        }
      } catch (dbError) {
        console.error("Error saving user to PostgreSQL database:", dbError);
        res.status(500).json({
          error: "Error saving user to PostgreSQL database",
          details: dbError.message,
        });
      }
    }

    // Step 7: Get Dashboard Embed URL
    const getDashboardParams = {
      AwsAccountId: "185329004895",
      DashboardId: "147334e5-b3cb-4c6b-ab90-dde2ff305707",
      IdentityType: "IAM",
      ResetDisabled: true,
      SessionLifetimeInMinutes: 100,
      UndoRedoDisabled: false,
    };

    console.log(
      "Calling GetDashboardEmbedUrlCommand with params:",
      getDashboardParams
    );

    try {
      const dashboardResponse = await quickSightClientWithCreds.send(
        new GetDashboardEmbedUrlCommand(getDashboardParams)
      );
      console.log("Dashboard Embed URL response:", dashboardResponse);
      res.status(200).json({ embedUrl: dashboardResponse.EmbedUrl });
    } catch (err) {
      console.error("Error fetching dashboard embed URL:", err);
      if (err.name === "AccessDeniedException") {
        console.log("The user does not have access to this dashboard.");
      } else if (err.name === "QuickSightDashboardNotFoundException") {
        console.log("The dashboard ID does not exist or is incorrect.");
      }
      res.status(500).json({
        error: "Error fetching dashboard embed URL",
        details: err.message,
      });
    }
  } catch (err) {
    console.error("Error:", err);
    res.json({ err });
  }
});

// Start the server
app.listen(3000, function () {
  console.log("App started");
});

module.exports = app;
