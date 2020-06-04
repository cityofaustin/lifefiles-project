// Load .env files
require("dotenv").config();
var Util = require("./common/Util");

// TODO: Add helmet
// const helmet = require("helmet");

// Loading from admin page
if (process.env.ENVIRONMENT === "HEROKU" && !Util.hasAllRequiredKeys()) {
  const express = require("express");
  const app = express();

  app.use(express.static(__dirname + "/public-admin"));

  const server = app.listen(process.env.PORT || 5000, function() {
    console.log("Listening on port " + server.address().port);
  });
  return;
}

const MongoDbClient = require("./database/mongodb/MongoDbClient");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const router = require("./routes");
const common = require("./common/common");
const { errors } = require("celebrate");
const fileUpload = require("express-fileupload");
// require("./routes/middleware/passport");
const oauthServer = require("./oath");
const DebugControl = require('./utilities/debug')

const app = express();
// app.oauth = new OAuthServer({
//   debug: true,
//   model: require('./database/mongodb/models/Oath'),
//   grants: ['implicit'],
// });

// Set Up Clients.
const dbClient = new MongoDbClient();

if (process.env.ETH_FUNDING_PRIVATE_KEY !== undefined) {
  const UportClient = require("./services/blockchain/UportClient");
  const blockchainClient = new UportClient();
  common.blockchainClient = blockchainClient;
} else {
  const SimpleBlockchainClient = require("./services/blockchain/SimpleBlockchainClient");
  const blockchainClient = new SimpleBlockchainClient();
  common.blockchainClient = blockchainClient;
}

common.dbClient = dbClient;

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
// app.use(app.oauth.authorize());
app.use(fileUpload({ useTempFiles: true }));

// Using NGIX cors config if production
if (
  process.env.ENVIRONMENT === "DEVELOPMENT" ||
  process.env.ENVIRONMENT === "HEROKU"
) {
  app.use(cors());
}

app.use(errors());
// app.use(router);
app.use('/oauth', require('./routes/auth.js')) // routes to access the auth stuff
app.use('/secure', (req,res,next) => {
  DebugControl.log.flow('Authentication')
  return next()
}, 
oauthServer.authenticate(), 
require('./routes/secure.js')) // routes to access the protected stuff


// error handler
app.use(function(err, req, res, next) {
  console.log(err.stack);

  res.status(err.status || 500);

  res.json({
    errors: {
      message: err.message,
      error: err,
    },
  });
});

const server = app.listen(process.env.PORT || 5000, function() {
  console.log("Listening on port " + server.address().port);
});
