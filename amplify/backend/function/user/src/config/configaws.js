const aws = require("aws-sdk");

// AWS Configuration
aws.config.update({
  accessKeyId: "AKIASWJTYGFP4Q3BAIWE",
  secretAccessKey: "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",
  region: "us-east-1",
});

const s3 = new aws.S3();

module.exports = s3;
