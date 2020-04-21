// Load .env files
require("dotenv").config();

const MongoDbClient = require("./database/mongodb/MongoDbClient");
const UportClient = require("./services/blockchain/UportClient");
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const cors = require("cors");
const router = require("./routes");
const common = require("./common/common");
const { errors } = require("celebrate");
const fileUpload = require("express-fileupload");
require("./routes/middleware/passport");
const app = express();

// Set Up Clients.
const dbClient = new MongoDbClient();
const blockchainClient = new UportClient();

common.dbClient = dbClient;
common.blockchainClient = blockchainClient;

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());
app.use(fileUpload({ useTempFiles: true }));

// Using NGIX cors config if production
if (process.env.ENVIRONMENT === "DEVELOPMENT") {
  app.use(cors());
}

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    cookie: { maxAge: 60000 },
    resave: false,
    saveUninitialized: false,
  })
);
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

const server = app.listen(process.env.PORT || 5000, function () {
  console.log("Listening on port " + server.address().port);
});
