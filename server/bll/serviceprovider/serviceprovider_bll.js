var
  util = require("util"),
  common = require("../common"),
  env = require('node-env-file'),
  bll = require('./index'),
  bcrypt = require('bcryptjs'),
  uuidV4 = require('uuid/v4'),
  sp_dal = require('./serviceprovider_dal')
  ;

env('./envVars.txt');
var microdb = require('../microdb')(process.env.MICRODB_MYPASS_DB_APIKEY);

exports.getByAccountId = getByAccountId;
exports.SaveProfile = SaveProfile;
exports.GetAll = GetAll;
exports.AddSP = AddSP;

function getByAccountId(id) {
  return sp_dal.getByAccountId(id);
}

function SaveProfile(data) {
  return sp_dal.SaveProfile(data);
}

function AddSP(data) {
  return sp_dal.AddSP(data);
}

function GetAll() {
  return sp_dal.GetAll();
}
