var
  util = require("util"),
  common = require("../common"),
  env = require('node-env-file'),
  owner_dal=require('./owner_dal')
   ;

  env('./envVars.txt');
  var microdb = require('../microdb')(process.env.MICRODB_MYPASS_DB_APIKEY);

  exports.getByAccountId=getByAccountId;
  exports.SaveProfile=SaveProfile;

  function getByAccountId(id) {
    return owner_dal.getByAccountId(id);
  }

  
function SaveProfile(data) {
  return owner_dal.SaveProfile(data);
}
