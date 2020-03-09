const crypto = require("crypto");
const multer = require("multer");
const multerS3 = require("multer-s3");
const path = require("path");

const AWS = require("aws-sdk");

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_KEY
});

var s3 = new AWS.S3();

const storage = multerS3({
  acl: "private",
  s3,
  bucket: process.env.AWS_BUCKET_NAME,
  serverSideEncryption: "AES256",
  metadata: function(req, file, cb) {
    cb(null, { fieldName: file.fieldname });
  },
  key: function(req, file, cb) {
    const buf = crypto.randomBytes(16);
    const filename = buf.toString("hex") + path.extname(file.originalname);
    cb(null, filename);
  }
});

const s3Upload = multer({ storage });
module.exports = s3Upload;
