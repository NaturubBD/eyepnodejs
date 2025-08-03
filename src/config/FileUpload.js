const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const { allowed_image_formats, allowed_file_formats } = require("../utils/constant");

const AWS_S3_BUCKET = process.env.AWS_S3_BUCKET;
const AWS_S3_ACCESS_KEY_ID = process.env.AWS_S3_ACCESS_KEY_ID;
const AWS_S3_SECRET_ACCESS_KEY = process.env.AWS_S3_SECRET_ACCESS_KEY;
const AWS_S3_REGION = process.env.AWS_S3_REGION;

const config = {
  accessKeyId: AWS_S3_ACCESS_KEY_ID,
  secretAccessKey: AWS_S3_SECRET_ACCESS_KEY,
  region: AWS_S3_REGION,
};
AWS.config.update(config);
const s3 = new AWS.S3();
exports.uploadFileToS3 = async (base64String, fileExtension, path) => {
  if (allowed_file_formats) {
    
  }
  const fileContent = Buffer.from(base64String, "base64");
  fileName = `${path}/${uuidv4()}.${fileExtension}`;
  const params = {
    Bucket: AWS_S3_BUCKET,
    Key: fileName,
    Body: fileContent,
    ACL: "public-read",
  };
  return await s3.upload(params).promise();
};

exports.uploadFileToS3FromBuffer = async (buffer, fileExtension, path) => {
  fileName = `${path}/${uuidv4()}.${fileExtension}`;
  const params = {
    Bucket: AWS_S3_BUCKET,
    Key: fileName,
    Body: buffer,
    ACL: "public-read",
  };
  return await s3.upload(params).promise();
};
