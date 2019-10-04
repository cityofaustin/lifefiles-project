/*
SP SPECIFIC BUSINESS LOGIC
*/

var
  sp_dal = require('./serviceprovider_dal')
  ;

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
