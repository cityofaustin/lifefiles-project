/*
OWNER SPECIFIC BUSINESS LOGIC
*/

var
  owner_dal = require('./owner_dal'),
  common = require("../../common")
  ;

exports.getByAccountId = getByAccountId;
exports.SaveProfile = SaveProfile;
exports.saveDocument = saveDocument;
exports.GetDocs = GetDocs;
exports.GetFile = GetFile;
exports.GetAll = GetAll;

function getByAccountId(id) {
  return owner_dal.getByAccountId(id);
}


function SaveProfile(data) {
  return owner_dal.SaveProfile(data);
}

function saveDocument(data) {
  return owner_dal.saveDocument(data);
}

function GetDocs(data) {
  return owner_dal.getDocs(data);
}

function GetFile(data) {
  return new Promise(function (resolve) {
    var response = new common.response();
    if (!data || (data && !data.thefile)) {
      response.success = false;
      resolve(response);
    }
    else {
      owner_dal.getFile(data).then(function (getres) {
        response.success = true;
        if (getres.success) {
          response.success = true;
          response.data = getres.data;
        }
        else {
          response.success = false;
        }
        resolve(response);
      });
    }
  });
}

function GetAll() {
  //check your business rules is current user can perform action
  return owner_dal.GetAll();
}