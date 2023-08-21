// Load .env files
require("dotenv").config();
var Util = require("./common/Util");

// Loading from admin page
if (process.env.ENVIRONMENT === "HEROKU" && !Util.hasAllRequiredKeys()) {
  const express = require("express");
  const app = express();

  app.use(express.static(__dirname + "/public-admin"));

  const server = app.listen(process.env.PORT || 5000, function () {
    console.log("Listening on port " + server.address().port);
  });
  return;
}

const MongoDbClient = require("./database/mongodb/MongoDbClient");
const express = require("express");
const bodyParser = require("body-parser");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const helmet = require("helmet");
const router = require("./routes");
const common = require("./common/common");
const { errors } = require("celebrate");
const fileUpload = require("express-fileupload");
require("./routes/middleware/passport");
const app = express();

// Using NGIX cors config if production
// NOTE: always use express cors as nginx doesn't send cors on failure
// if (
// process.env.ENVIRONMENT === "DEVELOPMENT" ||
// process.env.ENVIRONMENT === "HEROKU"
// ) {
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false,
  })
);
app.use(cors());
// }

const fs = require("fs");
const https = require("https");

// Set Up Clients.
const dbClient = new MongoDbClient();

if (process.env.ETH_FUNDING_PRIVATE_KEY !== undefined) {
  const UportClient = require("./services/blockchain/UportClient");
  const blockchainClient = new UportClient();
  common.blockchainClient = blockchainClient;

  const RskBlockchainClient = require("./services/blockchain/RskBlockchainClient");
  const rsk = new RskBlockchainClient();
  common.rskClient = rsk;
} else {
  const SimpleBlockchainClient = require("./services/blockchain/SimpleBlockchainClient");
  const blockchainClient = new SimpleBlockchainClient();
  common.blockchainClient = blockchainClient;
}

common.dbClient = dbClient;

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 200, // limit each IP to 100 requests per windowMs
});

// apply to all requests
app.use(limiter);

app.use(express.static(__dirname + "/public"));

app.use(
  bodyParser.json({
    limit: "50mb",
  })
);
app.use(
  fileUpload({
    limits: {
      fileSize: 5000000000, // 50mb
    },
    abortOnLimit: true,
    // this was incorrectly empty when attempting to load
    // profile images so using in-memory buffer as a workaround.
    useTempFiles: false,
  })
);
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.use(errors());
app.use(router);

// error handler
app.use(function (err, req, res, next) {
  console.log(err.stack);

  res.status(err.status || 500);

  res.json({
    errors: {
      message: err.message,
      error: err,
    },
  });
});

const port = 5000;
let key;
let cert;
try {
  key = fs.readFileSync("/home/ubuntu/STAGING/CERTS/server-key.pem");
  cert = fs.readFileSync("/home/ubuntu/STAGING/CERTS/server-cert.pem");
} catch (err) {
  console.log("key or cert not available. Continuing... ");
}

if (key !== undefined && cert !== undefined) {
  https
    .createServer(
      {
        key: fs.readFileSync("/home/ubuntu/STAGING/CERTS/server-key.pem"),
        cert: fs.readFileSync("/home/ubuntu/STAGING/CERTS/server-cert.pem"),
      },
      app
    )
    .listen(port, function () {
      console.log(
        "Mypass listening on port 5000! Go to https://localhost:5000/"
      );
    });
} else {
  const server = app.listen(process.env.PORT || port, function () {
    console.log("Mypass Listening on port " + server.address().port);
  });
}
