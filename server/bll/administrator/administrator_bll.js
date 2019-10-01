var
  util = require("util"),
  common = require("../../common"),
  env = require('node-env-file'),
  admin_dal = require('./administrator_dal')
  ;

env('./envVars.txt');
var microdb = require('../../microdb')(process.env.MICRODB_MYPASS_DB_APIKEY);

exports.getByAccountId = getByAccountId;
exports.SaveProfile = SaveProfile;

function getByAccountId(id) {
  return admin_dal.getByAccountId(id);
}


function SaveProfile(data) {
  return admin_dal.SaveProfile(data);
}
