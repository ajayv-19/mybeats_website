const {
  QuickSightClient,
  RegisterUserCommand,
  GetDashboardEmbedUrlCommand,
  ListUsersCommand,
  UpdateTopicPermissionsCommand,
  GenerateEmbedUrlForRegisteredUserCommand,
} = require("@aws-sdk/client-quicksight");

// quicksightClient = new AWS.Service({
//   apiConfig: require("./quicksight-2018-04-01.min.json"),
//   region: "us-east-1",
// });

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

var app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

const client = new Client({
  connectionString:
    "postgres://u7de1gksepndnt:pc9cf448765b86e4e33da258b19cb59a9c52c61efcea2fa686a2cd24170ef2bd0@c3gtj1dt5vh48j.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com:5432/d4cndihsitnn9n",
  ssl: {
    rejectUnauthorized: false,
  },
});

client.connect();

function getDomainFromEmail(email) {
  console.log(`Extracting domain from email: ${email}`);
  return email.split("@")[1];
}

app.get("/getQuickSightDashboardEmbedURL", async function (req, res) {
  const { email, jwtToken, payloadSub } = req.query;

  console.log("Received request with the following query parameters:");
  console.log(
    `Email: ${email}, JWT Token: ${jwtToken}, PayloadSub: ${payloadSub}`
  );

  const roleArn =
    "arn:aws:iam::185329004895:role/amplify-amplifyquicksightdas-dev-dd445-authRole";
  const region = "us-east-1";
  const sessionName = payloadSub;
  const topicId = "mKV8habamEDfLN80sBbVuqTpkVm1QV3M"; // Replace with your Topic ID
  const dashboardId = "147334e5-b3cb-4c6b-ab90-dde2ff305707";

  const cognitoClient = new CognitoIdentityClient({ region });
  const stsClient = new STSClient({ region });
  const quickSightClient = new QuickSightClient({ region });

  try {
    console.log("Step 1: Fetching Cognito Identity ID...");
    const idResponse = await cognitoClient.send(
      new GetIdCommand({
        IdentityPoolId: "us-east-1:3bed750a-a8a0-4866-b823-8f474cea8e6f",
        Logins: {
          "cognito-idp.us-east-1.amazonaws.com/us-east-1_O4uSMgJop": jwtToken,
        },
      })
    );
    console.log("Cognito Identity ID response:", idResponse);

    console.log("Step 2: Fetching OpenID Token...");
    const openIdTokenResponse = await cognitoClient.send(
      new GetOpenIdTokenCommand({
        IdentityId: idResponse.IdentityId,
        Logins: {
          "cognito-idp.us-east-1.amazonaws.com/us-east-1_O4uSMgJop": jwtToken,
        },
      })
    );
    console.log("OpenID Token response:", openIdTokenResponse);

    console.log("Step 3: Assuming IAM Role...");
    const stsResponse = await stsClient.send(
      new AssumeRoleWithWebIdentityCommand({
        RoleSessionName: sessionName,
        WebIdentityToken: openIdTokenResponse.Token,
        RoleArn: roleArn,
      })
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

    console.log("Step 4: Registering user in QuickSight...");
    const registerUserParams = {
      AwsAccountId: "185329004895",
      Email: email,
      IdentityType: "IAM",
      Namespace: "default",
      UserRole: "READER",
      IamArn: roleArn,
      SessionName: sessionName,
    };

    try {
      await quickSightClientWithCreds.send(
        new RegisterUserCommand(registerUserParams)
      );
      console.log("User registered successfully.");
    } catch (err) {
      if (err.name === "ResourceExistsException") {
        console.log("User already exists in QuickSight.");
      } else {
        console.error("Error registering user:", err);
        throw err;
      }
    }

    console.log("Step 5: Listing users in QuickSight...");
    const listUsersParams = {
      AwsAccountId: "185329004895",
      Namespace: "default",
    };

    let userName;
    const usersListResponse = await quickSightClientWithCreds.send(
      new ListUsersCommand(listUsersParams)
    );
    const users = usersListResponse.UserList;
    const registeredUser = users.find((user) => user.Email === email);
    if (registeredUser) {
      userName = registeredUser.UserName;
      console.log(`Found user: ${userName}`);
    } else {
      console.error("User not found in QuickSight.");
    }

    if (userName) {
      console.log("Step 6: Fetching domain and updating PostgreSQL...");
      const domain = getDomainFromEmail(email);
      const companyQuery =
        'SELECT company FROM "public"."Domain_companies" WHERE domain = $1';
      const selectResult = await client.query(companyQuery, [domain]);
      const company = selectResult.rows.length
        ? selectResult.rows[0].company
        : null;

      console.log(`Company associated with domain (${domain}): ${company}`);

      const rlsQuery =
        'INSERT INTO "public"."Row_level_security"("Company Name", "username") VALUES($1, $2) ON CONFLICT ("username") DO NOTHING;';
      await client.query(rlsQuery, [company, userName]);
    }

    console.log("Step 7: Granting access to QuickSight topic...");
    const topicPermissionParams = {
      AwsAccountId: "185329004895",
      TopicId: topicId,
      GrantPermissions: [
        {
          Principal: `arn:aws:quicksight:${region}:${roleArn.split(":")[4]}:user/default/${userName}`,
          Actions: ["quicksight:DescribeTopic"],
        },
      ],
    };

    await quickSightClientWithCreds.send(
      new UpdateTopicPermissionsCommand(topicPermissionParams)
    );
    console.log("Topic permissions granted successfully.");

    console.log("Step 8: Generating dashboard embed URL...");
    const userArn = `arn:aws:quicksight:${region}:185329004895:user/default/${userName}`;

    const dashboardParams = {
      AwsAccountId: "185329004895",
      ExperienceConfiguration: {
        Dashboard: {
          InitialDashboardId: dashboardId,
        },
      },
      UserArn: userArn,
      SessionLifetimeInMinutes: 100,
    };

    const dashboardResponse = await quickSightClientWithCreds.send(
      new GenerateEmbedUrlForRegisteredUserCommand(dashboardParams)
    );

    console.log("Dashboard Embed URL:", dashboardResponse.EmbedUrl);
    console.log("Step 6: Generating embed URL for Generative Q&A...");
    const generativeQnAParams = {
      AwsAccountId: "185329004895",
      ExperienceConfiguration: {
        GenerativeQnA: {
          InitialTopicId: topicId,
        },
      },
      UserArn: userArn,
      SessionLifetimeInMinutes: 100,
    };

    const generativeQnAResponse = await quickSightClientWithCreds.send(
      new GenerateEmbedUrlForRegisteredUserCommand(generativeQnAParams)
    );

    console.log("Generative Q&A Embed URL:", generativeQnAResponse.EmbedUrl);

    res.status(200).json({
      embedUrl: dashboardResponse.EmbedUrl,
      generativeQnAEmbedUrl: generativeQnAResponse.EmbedUrl,
    });
  } catch (err) {
    console.error("Error occurred:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, function () {
  console.log("App started on port 3000");
});

module.exports = app;
