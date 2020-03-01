var jwt = require("express-jwt");

function getTokenFromHeader(req) {
  if (
    (req.headers.authorization &&
      req.headers.authorization.split(" ")[0] === "Token") ||
    (req.headers.authorization &&
      req.headers.authorization.split(" ")[0] === "Bearer")
  ) {
    return req.headers.authorization.split(" ")[1];
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
  required: jwt({
    secret: process.env.AUTH_SECRET,
    userProperty: "payload",
    getToken: getTokenFromHeader
  }),
  image: jwt({
    secret: process.env.AUTH_SECRET,
    userProperty: "payload",
    getToken: getTokenFromParams
  }),
  optional: jwt({
    secret: process.env.AUTH_SECRET,
    userProperty: "payload",
    credentialsRequired: false,
    getToken: getTokenFromHeader
  })
};

module.exports = auth;
