const OAuthServer = require("express-oauth-server");
const model = require("./database/mongodb/models/Oath");

module.exports = new OAuthServer({
  debug: true,
  model,
  grants: ["authorization_code"],
  allowBearerTokensInQueryString: true
});
