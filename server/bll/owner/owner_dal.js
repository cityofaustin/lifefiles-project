/*
OWNER SPECIFIC DATA ACCESS
*/


var
  util = require("util"),
  common = require("../../common"),
  env = require('node-env-file')
   ;

  env('./envVars.txt');
  var microdb = require('../../microdb')(process.env.MICRODB_MYPASS_DB_APIKEY);

  exports.getByAccountId=getByAccountId;
  exports.SaveProfile=SaveProfile;

  function getByAccountId(id) {
    return new Promise((resolve) => {
      microdb.Tables.owner.get({'accountid': id }).then(function (res) {
        var response = new common.response();
        if (!res.success){
          response.message='error attempting to get by accountid';
          response.success = false;
        }
        else {
          response.user = res.data && res.data.Rows? res.data.Rows:[];
          response.success = true;
        }
        resolve(response);
      });
    });
  }

  
function SaveProfile(data) {
  return new Promise((resolve) => {
    data.Profile.primarykey = data.AccountInfo.primarykey; 
    microdb.Tables.owner.saveUpdate(data.Profile).then(function (saveres) {
      var response = new common.response();
      response.success = true;
      if (saveres.success && saveres.data && saveres.data.updatedRows) {
        response.success = true;
      }
      else {
        response.success = false;
      }
      resolve(response);
    });
  });
}
