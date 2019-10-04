/*
OWNER SPECIFIC BUSINESS LOGIC
*/

var
  owner_dal=require('./owner_dal')
   ;

  exports.getByAccountId=getByAccountId;
  exports.SaveProfile=SaveProfile;

  function getByAccountId(id) {
    return owner_dal.getByAccountId(id);
  }

  
function SaveProfile(data) {
  return owner_dal.SaveProfile(data);
}
