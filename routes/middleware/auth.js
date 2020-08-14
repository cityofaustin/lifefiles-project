var jwt = require("express-jwt");
const common = require("../../common/common");
const jsonwebtoken = require("jsonwebtoken");

function getTokenFromHeader(req) {
  if (
    (req.headers.authorization &&
      req.headers.authorization.split(" ")[0] === "Token") ||
    (req.headers.authorization &&
      req.headers.authorization.split(" ")[0] === "Bearer")
  ) {
    let oauthJwt = req.headers.authorization.split(" ")[1];

    return oauthJwt;
  }

  return null;
}

function getTokenFromParams(req) {
  if (req.params && req.params.jwt !== undefined) {
    return req.params.jwt;
  } else {
    return null;
  }
}

var auth = {
  required: async (req, res, next) => {
    let oauthJwt = getTokenFromHeader(req);
    let decoded;
    try {
      decoded = jsonwebtoken.verify(oauthJwt, process.env.AUTH_SECRET);
    } catch (err) {
      console.log("Invalid token!");
      console.log(err);
      res.status(403).json({
        error: "Account not authorized. Invalid auth token",
      });
    }

    // This is not from oauth server and is local auth
    if (decoded.oauthId === undefined) {
      const payload = {
        id: "" + decoded.id,
        username: decoded.username,
        role: decoded.role,
      };
      req.payload = payload;
      next();
      return;
    }

    const account = await common.dbClient.getAccountByOAuthId(decoded.oauthId);

    let payload = {};

    // We have a new account
    if (account === undefined || account === null) {
      payload = {
        oauthId: decoded.oauthId,
        username: decoded.username,
        phoneNumber: decoded.phoneNumber
      };
    } else {
      payload = {
        id: "" + account._id,
        username: account.username,
        role: account.role,
      };
    }

    req.payload = payload;

    next();
  },

  image: async (req, res, next) => {
    let oauthJwt = getTokenFromParams(req);

    let decoded;
    try {
      decoded = jsonwebtoken.verify(oauthJwt, process.env.AUTH_SECRET);
    } catch (err) {
      console.log("Invalid token in image auth!");
      console.log(err);
      res.status(403).json({
        error: "Account not authorized to view this document",
      });
    }

    if (decoded.oauthId === undefined) {
      const payload = {
        id: "" + decoded.id,
        username: decoded.username,
        role: decoded.role,
      };

      req.payload = payload;
      next();
      return;
    }

    const account = await common.dbClient.getAccountByOAuthId(decoded.oauthId);

    payload = {
      id: "" + account._id,
      username: account.username,
      role: account.role,
    };
    req.payload = payload;

    next();
  },
};

module.exports = auth;
