// Load .env files
require("dotenv").config();

let MongoDbClient = require("./database/mongodb/MongoDbClient");
let UportClient = require("./services/blockchain/UportClient");
let express = require("express");
let bodyParser = require("body-parser");
let session = require("express-session");
let cors = require("cors");
let router = require("./routes");
let common = require("./common/common");
let { errors } = require("celebrate");
require("./routes/middleware/passport");

const app = express();

// Set Up Clients.
let dbClient = new MongoDbClient();
let blockchainClient = new UportClient();

common.dbClient = dbClient;
common.blockchainClient = blockchainClient;

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());
app.use(cors());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    cookie: { maxAge: 60000 },
    resave: false,
    saveUninitialized: false
  })
);
app.use(errors());

app.use(router);

// error handler
app.use(function(err, req, res, next) {
  console.log(err.stack);

  res.status(err.status || 500);

  res.json({
    errors: {
      message: err.message,
      error: err
    }
  });
});

var server = app.listen(process.env.PORT || 5000, function() {
  console.log("Listening on port " + server.address().port);
});
