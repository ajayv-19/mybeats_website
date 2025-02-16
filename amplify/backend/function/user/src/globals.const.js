const APP_URL = "https://mybeatshealth.com";
const API_URL = "https://b89ns5qxe2.execute-api.us-east-1.amazonaws.com/dev";
const API_PREFIX = "/backendapi";
const STRIPE_SECRET_KEY =
  "sk_test_51QVNrHDIv4SXGrBx2A7QJ6Cwm4SwbJbK43m2zxFA0bXo9cTL7Y32vGvVINJJwXGCZM08JlWICoMlaam8ZiMBh8Ah000PRm2GzX";
const COGNITO_PUBLIC_KEY =
  "3aUW5pvadn0KDsj9RoZKWwxagVzWk3sq2yoMIlGbkibXMDmAxZB7dU_YXIux1iGoPoqPzM2ANT_qwJIVeOnlHUIcnCJxF6uVBw0mJcxvVrId_aPPH3Fsv5FJMWGx0_qtcjwCEUlXV0op04OaS_7kcbvXL7wkzNlJTGkbz8DIUKF8QZdMH2WKvJPhwWZfcaHU6xlLkv-q65_LduA_7TjOOHjL17utXv97sI5PE5j4F1ZscuXtkEwvygr8Ikko5A9qDYHviPY7wd4vyQQBSGp-vDWsdfmTZ0kws8K5mZfb2OfR3pdUyVUfGP6072j0HWPBpMS9iB25xzi9rmf43ehTFw";
const COGNITO_REGION = "us-east-1";
const COGNITO_USER_POOL_ID = "us-east-1_O4uSMgJop";
const COGNITO_ISSUER = `https://cognito-idp.${COGNITO_REGION}.amazonaws.com/${COGNITO_USER_POOL_ID}`;
//const COGNITO_JWT_JSON = "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_SJCgjQah1/.well-known/jwks.json ";
const COGNITO_JWT_JSON = `${COGNITO_ISSUER}/.well-known/jwks.json`;

module.exports = {
  APP_URL,
  API_URL,
  API_PREFIX,
  STRIPE_SECRET_KEY,
  COGNITO_PUBLIC_KEY,
  AWS_REGION: COGNITO_REGION,
  COGNITO_REGION,
  COGNITO_USER_POOL_ID,
  COGNITO_ISSUER,
  COGNITO_JWT_JSON,
};
