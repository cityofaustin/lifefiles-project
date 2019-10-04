/*
ADMIN SPECIFIC BUSINESS LOGIC
*/
var
  admin_dal = require('./administrator_dal')
  ;

exports.getByAccountId = getByAccountId;
exports.SaveProfile = SaveProfile;

function getByAccountId(id) {
  return admin_dal.getByAccountId(id);
}


function SaveProfile(data) {
  return admin_dal.SaveProfile(data);
}
