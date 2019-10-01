var
  util = require("util"),
  common = require("../../common"),
  env = require('node-env-file'),
  agent_dal=require('./agent_dal')
  ;

env('./envVars.txt');
var microdb = require('../../microdb')(process.env.MICRODB_MYPASS_DB_APIKEY);

exports.getByAccountId = getByAccountId;
exports.SaveProfile = SaveProfile;
exports.GetAll = GetAll;

function getByAccountId(id) {
  return agent_dal.getByAccountId(id);
}

function SaveProfile(data) {
  return agent_dal.SaveProfile(data);
}


function GetAll() {
  return agent_dal.GetAll();
}

