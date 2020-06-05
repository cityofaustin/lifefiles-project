const common = require("../../../common/common"); 
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const jwt = require("jsonwebtoken");


mongoose.model(
  "OAuthToken",
  new Schema({
    accessToken: { type: String },
    accessTokenExpiresAt: { type: Date },
    client: { type: mongoose.Schema.Types.ObjectId, ref: "OAuthClient" },
    clientId: { type: String },
    refreshToken: { type: String },
    refreshTokenExpiresAt: { type: Date },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
    userId: { type: String },
  })
);

mongoose.model(
  "OAuthAuthorizationCode",
  new Schema({
    authorizationCode: { type: String },
    expiresAt: { type: Date },
    redirectUri: { type: Object },
    client: { type: mongoose.Schema.Types.ObjectId, ref: "OAuthClient" },
    clientId: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
    userId: { type: String },
  })
);

mongoose.model(
  "OAuthClient",
  new Schema({
    clientId: { type: String },
    clientSecret: { type: String },
    redirectUris: { type: Array },
    grants: { type: Array },
  })
);

mongoose.model(
  "OAuthUser",
  new Schema({
    email: { type: String, default: "" },
    firstname: { type: String },
    lastname: { type: String },
    password: { type: String },
    username: { type: String },
  })
);

const OAuthTokensModel = mongoose.model("OAuthToken");
const OAuthClientsModel = mongoose.model("OAuthClient");
const OAuthUsersModel = mongoose.model("OAuthUser");
const OAuthAuthorizationCodesModel = mongoose.model("OAuthAuthorizationCode");

module.exports.getAccessToken = async (bearerToken) => {
  const oathToken = await OAuthTokensModel.findOne({
    accessToken: bearerToken,
  }).lean();
  return oathToken;
};

module.exports.getRefreshToken = async (refreshToken) => {
  return await OAuthTokensModel.findOne({ refreshToken: refreshToken }).lean();
};

module.exports.getAuthorizationCode = async (authorizationCode) => {
  const authCode = await OAuthAuthorizationCodesModel.findOne({
    authorizationCode,
  })
    .populate("client")
    .populate("user")
    .lean();
  return authCode;
};

module.exports.getClient = async (clientId, clientSecret) => {
  const oathClient = await OAuthClientsModel.findOne({
    clientId: clientId,
    clientSecret: clientSecret,
  }).lean();
  return oathClient;
};

module.exports.getUser = async (username, password) => {
  return await OAuthUsersModel.findOne({
    username: username,
    password: password,
  }).lean();
};

module.exports.saveToken = async (token, client, user) => {
  // accessToken currently looks like 72f85b607c17f0b1e88b5e64ec260d1e022f3d59
  // TODO: make a JWT instead for access and refresh.

  const accessToken = new OAuthTokensModel({
    accessToken: token.accessToken,
    accessTokenExpiresAt: token.accessTokenExpiresAt,
    client: client,
    clientId: client.clientId,
    refreshToken: token.refreshToken,
    refreshTokenExpiresAt: token.refreshTokenExpiresAt,
    user: user,
    userId: user._id,
  });

  // Can't just chain `lean()` to `save()` as we did with `findOne()` elsewhere. Instead we use `Promise` to resolve the data.
  let saveResult = await accessToken.save();
  
  const accessJWT = jwt.sign(
    {
        sub: user._id, // subject, whom the token refers to
        // event_id: '',
        token_use: 'access',
        scope: user.role,
        auth_time: parseInt(new Date().getTime() / 1000), // time when authetication occurred
        iss: 'http://localhost:5000', // issuer, who created and signed this token
        exp: parseInt(token.accessTokenExpiresAt.getTime() / 1000), // expiration time, seconds since unix epoch
        // iat issued at, don't need it's automatically created for us
        jti: saveResult._id, // jwt id unique identifier for this token
        client_id: clearInterval.clientId,
        username: user.username,
    },
    process.env.AUTH_SECRET
  );
  saveResult.accessToken = accessJWT;
  saveResult = await accessToken.save();

  // `saveResult` is mongoose wrapper object, not doc itself. Calling `toJSON()` returns the doc.
  saveResult =
    saveResult && typeof saveResult == "object"
      ? saveResult.toJSON()
      : saveResult;
  // Unsure what else points to `saveResult` in oauth2-server, making copy to be safe
  const data = new Object();
  for (const prop in saveResult) data[prop] = saveResult[prop];
  // /oauth-server/lib/models/token-model.js complains if missing `client` and `user`. Creating missing properties.
  data.client = data.clientId;
  data.user = data.userId;

  return data;
};

// Invoked during: authorization_code grant
module.exports.saveAuthorizationCode = async (code, client, user) => {
  const authCode = new OAuthAuthorizationCodesModel({
    authorizationCode: code.authorizationCode,
    expiresAt: code.expiresAt,
    redirectUri: code.redirectUri,
    // scope: code.scope, // you can use this to specify permissions
    clientId: client.clientId,
    userId: user._id,
  });
  const clientSaved = await this.getClient(
    client.clientId,
    client.clientSecret
  );
  const userSaved = await common.dbClient.getAccountById(user._id);
  authCode.client = clientSaved;
  authCode.user = userSaved;

  let saveResult = await authCode.save();
  saveResult =
    saveResult && typeof saveResult == "object"
      ? saveResult.toJSON()
      : saveResult;
  const data = new Object();
  for (const prop in saveResult) data[prop] = saveResult[prop];
  return data;
};

/**
 * Revoke the authorization code.
 * @see https://github.com/oauthjs/node-oauth2-server/blob/master/lib/grant-types/authorization-code-grant-type.js#L159
 * @see https://tools.ietf.org/html/rfc6749#section-4.1.2
 */
module.exports.revokeAuthorizationCode = async (code) => {
  await OAuthAuthorizationCodesModel.deleteMany({
    authorizationCode: code.authorizationCode,
  });
  return true;
};
