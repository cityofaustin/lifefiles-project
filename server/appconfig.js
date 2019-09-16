
var
util = require("util"),
fs = require('fs'),
env = require('node-env-file'),
_ = require('lodash'),
logger = require('./common/logger')
;


var Singleton = (function () {
var instance;

function Configuration() {
  env('./envVars.txt');

  this.aws = {};
  this.microdb_api_key='71ade3fbf51043b19e3d53fe28a0e7a89676e3e1f02c49909bde1378cc8d4c91';

  this.ENVIRONMENT = {
    LOCAL: 'local',
    PROD: 'production',
    DEV: 'development'
  };

  
  log('SERVER_PORT ' + process.env.SERVER_PORT);
  log('process.env.NODE_ENV = ' + util.inspect(_.trim(process.env.NODE_ENV)));

  this.tempSavePath = '/tmp_uploads/';
  //this.AWS_CERT_PATH='rds-ca-2015-us-west-2.pem';

  if (_.trim(process.env.NODE_ENV) == this.ENVIRONMENT.PROD) {
    //config here
  }
  else if (_.trim(process.env.NODE_ENV) == this.ENVIRONMENT.DEV) {
    //config here
  }
  else {
    //config here
  }

  
}

function log(msg) {
  logger.log('config.js...' + msg);
}

function createInstance() {
  var object = new Configuration();
  return object;
}

return {
  getInstance: function () {
    if (!instance) {
      instance = createInstance();
    }
    return instance;
  }
};
})();

module.exports = Singleton.getInstance();

