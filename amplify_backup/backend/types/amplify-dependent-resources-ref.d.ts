export type AmplifyDependentResourcesAttributes = {
  api: {
    backendapi: {
      ApiId: "string";
      ApiName: "string";
      RootUrl: "string";
    };
    backendapis: {
      ApiId: "string";
      ApiName: "string";
      RootUrl: "string";
    };
    quicksight: {
      ApiId: "string";
      ApiName: "string";
      RootUrl: "string";
    };
  };
  auth: {
    amplifyquicksightdas151f0caf: {
      AppClientID: "string";
      AppClientIDWeb: "string";
      IdentityPoolId: "string";
      IdentityPoolName: "string";
      UserPoolArn: "string";
      UserPoolId: "string";
      UserPoolName: "string";
    };
  };
  function: {
    getQuickSightDashboardEmbedURL: {
      Arn: "string";
      LambdaExecutionRole: "string";
      LambdaExecutionRoleArn: "string";
      Name: "string";
      Region: "string";
    };
    getcompanyofuser: {
      Arn: "string";
      LambdaExecutionRole: "string";
      LambdaExecutionRoleArn: "string";
      Name: "string";
      Region: "string";
    };
    user: {
      Arn: "string";
      LambdaExecutionRole: "string";
      LambdaExecutionRoleArn: "string";
      Name: "string";
      Region: "string";
    };
  };
  storage: {
    InsuranceDashboardImages: {
      BucketName: "string";
      Region: "string";
    };
  };
};
