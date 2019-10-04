/*
AGENT SPECIFIC BUSINESS LOGIC
*/

var
  agent_dal=require('./agent_dal')
  ;

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

