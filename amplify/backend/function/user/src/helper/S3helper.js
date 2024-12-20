const AWS = require("aws-sdk");
const config = require("../config.json");
const s3Config = {
  apiVersion: "2006-03-01",
  accessKeyId: config.accessKeyId,
  secretAccessKey: config.secretAccessKey,
  region: config.region,
};
const s3 = new AWS.S3(s3Config);

module.exports.createBucket = (bucketName) => {
  s3.createBucket({
    Bucket: bucketName,
    CreateBucketConfiguration: {
      LocationConstraint: config.region,
    },
    ACL: "private",
    GrantRead: "IAM_USERID",
    GrantWrite: "IAM_USERID",
    GrantFullControl: "IAM_USERID",
    GrantReadACP: "IAM_USERID",
    GrantWriteACP: "IAM_USERID",
    ObjectLockEnabledForBucket: false,
  }).promise();
};

module.exports.deleteFile = (serverPath) =>
  s3
    .deleteObject({
      Bucket: BUCKET,
      Key: serverPath,
    })
    .promise();
const serverPaths = [
  {
    Key: "1.jpg",
  },
  {
    Key: "2.jpg",
  },
];
module.exports.deleteFiles = (serverPaths) =>
  s3
    .deleteObjects({
      Bucket: BUCKET,
      Delete: [
        {
          Objects: serverPaths,
        },
      ],
    })
    .promise();

const downloadUrl = (key) =>
  s3.getSignedUrlPromise("getObject", {
    Bucket: BUCKET,
    Key: key,
    Expires: 1800,
  });
