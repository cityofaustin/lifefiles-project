const common = require("../common/common");
const request = require("request").defaults({ encoding: null });
const md5 = require("md5");
const ip = require("ip");
const streamBuffers = require("stream-buffers");

const AWS = require("aws-sdk");

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_KEY
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

      request.get(localUrl, function(err, res, body) {
        const md5Hash = md5(body);
        resolve(md5Hash);
      });
    });
  },

  getDocumentBytes: async filename => {
    if (process.env.DOCUMENT_STORAGE_CHOICE === "S3") {
      return new Promise((resolve, reject) => {
        s3.getObject(
          {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: filename
          },
          function(err, data) {
            // Handle any error and exit
            if (err) {
              console.log("s3 Error");
              console.log(err);
            }

            let myReadableStreamBuffer = new streamBuffers.ReadableStreamBuffer(
              {
                frequency: streamBuffers.DEFAULT_FREQUENCY, // (1) in milliseconds.
                chunkSize: streamBuffers.DEFAULT_CHUNK_SIZE // (1024) in bytes.
              }
            );

            myReadableStreamBuffer.put(data.Body);
            myReadableStreamBuffer.stop();

            resolve(myReadableStreamBuffer);
          }
        );
      });
    } else {
      let payload = await common.dbClient.getDocumentData(filename);
      return payload;
    }
  },

  deleteDocumentBytes: async filename => {
    if (process.env.DOCUMENT_STORAGE_CHOICE === "S3") {
      return new Promise((resolve, reject) => {
        s3.deleteObject(
          {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: filename
          },
          function(err, data) {
            // Handle any error and exit
            if (err) {
              console.log("s3 Error");
              console.log(err);
            }

            resolve("Delete Successful");
          }
        );
      });
    } else {
      await common.dbClient.deleteDocumentData(filename);
    }
  }
};
