/*
THIS IS A DATA HELPER CLASS TO FETCH ENUMERATIONS AND OTHER DATA STORED IN MICRODB
WHICH IS USED IN THE APP
*/

var  env = require('node-env-file');
env('./envVars.txt');
var microdb = require('microdb-api')(process.env.MICRODB_MYPASS_DB_APIKEY);
microdb.on(microdb.Events.init,mdbLoaded);

var __AccountRoles;
exports.getAccountRoles = getAccountRoles;

function getAccountRoles() {
    return __AccountRoles;
}

function mdbLoaded() {
  microdb.Tables.accountroles.get().then(function (res) {
    if (res.success) {
      __AccountRoles = res.data && res.data.Rows ? res.data.Rows : [];
    }
  });
}
