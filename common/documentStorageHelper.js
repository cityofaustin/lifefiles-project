const crypto = require("crypto");
const path = require("path");
const request = require("request").defaults({ encoding: null });
const md5 = require("md5");
const ip = require("ip");
const streamBuffers = require("stream-buffers");
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");

const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
  region: "us-east-1",
});

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

    // this was incorrectly empty when attempting to load
    // profile images so using in-memory buffer as a workaround.
    // let contents = fs.readFileSync(file.tempFilePath);
    const contents = file.data;
    const command = new PutObjectCommand({
      ACL: "private",
      ServerSideEncryption: "AES256",
      Bucket: bucketName,
      Key: key,
      Body: contents,
    });
    try {
      await s3.send(command);
    } catch (err) {
      console.log("S3 Error");
      console.log(err);
    }
    return key;
  },

  getDocumentBytes: async (filename, type) => {
    let bucketName = process.env.AWS_DOCUMENTS_BUCKET_NAME;
    if (type === "profile-image") {
      bucketName = process.env.AWS_PROFILE_IMAGES_BUCKET_NAME;
    }
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: filename,
    });
    try {
      const response = await client.send(command);
      // The Body object also has 'transformToByteArray' and 'transformToWebStream' methods.
      const str = await response.Body.transformToString();
      let myReadableStreamBuffer = new streamBuffers.ReadableStreamBuffer({
        frequency: streamBuffers.DEFAULT_FREQUENCY, // (1) in milliseconds.
        chunkSize: streamBuffers.DEFAULT_CHUNK_SIZE, // (1024) in bytes.
      });

      myReadableStreamBuffer.put(str);
      myReadableStreamBuffer.stop();
      return myReadableStreamBuffer;
    } catch (err) {
      console.log("S3 Error");
      console.log(err);
    }
  },

  deleteDocumentBytes: async (filename, type) => {
    let bucketName = process.env.AWS_DOCUMENTS_BUCKET_NAME;
    if (type === "profile-image") {
      bucketName = process.env.AWS_PROFILE_IMAGES_BUCKET_NAME;
    }
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: filename,
    });

    try {
      await client.send(command);
      return "Delete Successful";
    } catch (err) {
      console.log("S3 Error");
      console.log(err);
    }
  },

  uploadPublicVCJwt: async (vcJwt, did, timeInSeconds) => {
    let bucketName = process.env.AWS_NOTARIZED_VPJWT_BUCKET_NAME;

    let vpJwtObject = { vcJwt: vcJwt, timestamp: timeInSeconds };

    console.log({ did });
    const command = new PutObjectCommand({
      ACL: "public-read",
      Bucket: bucketName,
      Key: did,
      Body: Buffer.from(JSON.stringify(vpJwtObject), "utf8"),
    });
    try {
      const s3Res = await s3.send(command);
      return s3Res;
    } catch (err) {
      console.log("S3 Error");
      console.log(err);
    }
  },

  uploadPublicVPJwt: async (vpJwt, did, timeInSeconds) => {
    let bucketName = process.env.AWS_NOTARIZED_VPJWT_BUCKET_NAME;

    let vpJwtObject = { vpJwt: vpJwt, timestamp: timeInSeconds };

    console.log({ did });
    const command = new PutObjectCommand({
      ACL: "public-read",
      Bucket: bucketName,
      Key: did,
      Body: Buffer.from(JSON.stringify(vpJwtObject), "utf8"),
    });
    try {
      const s3Res = await s3.send(command);
      return s3Res;
    } catch (err) {
      console.log("S3 Error");
      console.log(err);
    }
  },
};
