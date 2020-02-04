var
  util = require("util"),
  common = require("../common"),
  env = require('node-env-file')
  ;

env('./envVars.txt');
module.exports = require('./providers/' + process.env.dataprovider);
