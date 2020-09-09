const crypto = require("crypto");
const path = require("path");
const request = require("request").defaults({ encoding: null });
const md5 = require("md5");
const ip = require("ip");
const fs = require("fs");
const streamBuffers = require("stream-buffers");

const AWS = require("aws-sdk");

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_KEY,
});

var s3 = new AWS.S3();

module.exports = {
  getMD5: async (documentUrl, jwt) => {
    return new Promise((resolve, reject) => {
      // Hash from URL
      let localUrl =
        "http://" +
        ip.address() +
        ":" +
        (process.env.PORT || 5000) +
        "/api/documents/" +
        documentUrl +
        "/" +
        jwt;

      request.get(localUrl, function (err, res, body) {
        if (err) {
          console.log("Get MD5 Error: " + err);
        }
        const md5Hash = md5(body);
        resolve(md5Hash);
      });
    });
  },

  upload: async (file, type) => {
    let bucketName = process.env.AWS_DOCUMENTS_BUCKET_NAME;
    if (type === "profile-image") {
      bucketName = process.env.AWS_PROFILE_IMAGES_BUCKET_NAME;
    }

    const buf = crypto.randomBytes(16);
    const key = buf.toString("hex") + path.extname(file.name);
    await new Promise((resolve, reject) => {
      s3.putObject(
        {
          ACL: "private",
          ServerSideEncryption: "AES256",
          Bucket: bucketName,
          Key: key,
          Body: fs.readFileSync(file.tempFilePath),
        },
        function (err, data) {
          // Handle any error and exit
          if (err) {
            console.log("S3 Error");
            console.log(err);
            return;
          }
          resolve(data);
        }
      );
    });

    return key;
  },

  getDocumentBytes: async (filename, type) => {
    let bucketName = process.env.AWS_DOCUMENTS_BUCKET_NAME;
    if (type === "profile-image") {
      bucketName = process.env.AWS_PROFILE_IMAGES_BUCKET_NAME;
    }

    return new Promise((resolve, reject) => {
      s3.getObject(
        {
          Bucket: bucketName,
          Key: filename,
        },
        function (err, data) {
          // Handle any error and exit
          if (err) {
            console.log("S3 Error");
            console.log(err);
            return;
          }

          let myReadableStreamBuffer = new streamBuffers.ReadableStreamBuffer({
            frequency: streamBuffers.DEFAULT_FREQUENCY, // (1) in milliseconds.
            chunkSize: streamBuffers.DEFAULT_CHUNK_SIZE, // (1024) in bytes.
          });

          myReadableStreamBuffer.put(data.Body);
          myReadableStreamBuffer.stop();

          resolve(myReadableStreamBuffer);
        }
      );
    });
  },

  deleteDocumentBytes: async (filename, type) => {
    let bucketName = process.env.AWS_DOCUMENTS_BUCKET_NAME;
    if (type === "profile-image") {
      bucketName = process.env.AWS_PROFILE_IMAGES_BUCKET_NAME;
    }

    return new Promise((resolve, reject) => {
      s3.deleteObject(
        {
          Bucket: bucketName,
          Key: filename,
        },
        function (err, data) {
          // Handle any error and exit
          if (err) {
            console.log("S3 Error");
            console.log(err);
            return;
          }

          resolve("Delete Successful");
        }
      );
    });
  },

  uploadPublicVPJwt: async (vpJwt, did, timeInSeconds) => {
    let bucketName = process.env.AWS_NOTARIZED_VPJWT_BUCKET_NAME;

    let vpJwtObject = { vpJwt: vpJwt, timestamp: timeInSeconds };

    console.log({ did });
    let s3Res = await new Promise((resolve, reject) => {
      s3.putObject(
        {
          ACL: "public-read",
          Bucket: bucketName,
          Key: did,
          Body: Buffer.from(JSON.stringify(vpJwtObject), "utf8"),
        },
        function (err, data) {
          // Handle any error and exit
          if (err) {
            console.log("S3 Error");
            console.log(err);
            return;
          }
          resolve(data);
        }
      );
    });

    return s3Res;
  },
};
