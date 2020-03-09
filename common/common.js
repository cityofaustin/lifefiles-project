const request = require("request").defaults({ encoding: null });
const md5 = require("md5");
const ip = require("ip");

module.exports = {
  dbClient: undefined,
  blockchainClient: undefined
};
