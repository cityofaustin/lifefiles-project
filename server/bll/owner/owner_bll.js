/*
OWNER SPECIFIC BUSINESS LOGIC
*/

var
  common = require("../../common"),
  permanent = require('permanent-api-js'),
  datacontext=require('../../datacontext')
  ;


exports.getByAccountId = getByAccountId;
exports.saveProfile = saveProfile;
exports.saveDocument = saveDocument;
exports.getDocs = getDocs;
exports.getFile = getFile;
exports.getAll = getAll;
exports.addOwner = addOwner;
exports.getOwner = getOwner;

function getByAccountId(id) {
  return datacontext.owner.getByAccountId(id);
}

function saveProfile(data) {
  return datacontext.owner.saveProfile(data);
}

function saveDocument(data) {
  return new Promise(function (resolve) {
    var response = new common.response();
    var isvalid = false;

    if (!data || (data && (!data.fileInfo || !data.FileName))) {
      response.success = false;
      response.message = 'no file info';
      resolve(response);
      return;
    }

    var ownerpk = data.ownerkey > 0 ? data.ownerkey : data.User.AccountInfo.primarykey;
    datacontext.owner.getOwner(ownerpk).then(function (geto) {
      if (!geto.success || geto.data && geto.data.Rows.length < 1) {
        response.success = false;
        response.message = 'no owner found';
        resolve(response);
      }
      else {
        var owner = geto.data.Rows[0];
        if (!owner.permanent_archive_number) {
          response.success = false;
          response.message = 'no permanent archive number found for owner';
          resolve(response);
        }
        else {
          var docreq = {
            ownerpk:ownerpk,
            doc:{
            file: new permanent.File(data.fileInfo),
            archive_number: owner.permanent_archive_number,
            originalname: data.fileInfo.originalname,
            filehandle: data.fileInfo.filename
            }
          };
          datacontext.owner.saveDocument(docreq).then(resolve);
        }
      }
    });
  });
}

function getDocs(data) {
  return new Promise(function (resolve) {
    var response = new common.response();
    if (!data || (data && !data.ownerid)) {
      response.success = false;
      resolve(response);
    }
    else {
      datacontext.owner.getDocs(data).then(function (getres) {
        resolve(getres);
      });
    }
  });
}

function getFile(data) {
  return new Promise(function (resolve) {
    var response = new common.response();
    if (!data || (data && !data.primarykey)) {
      response.success = false;
      resolve(response);
    }
    else {
      datacontext.owner.getFile(data.primarykey).then(function (getres) {
          resolve(getres);
        });
    }
  });
}

function getAll() {
  //check your business rules is current user can perform action
  return datacontext.owner.getAll();
}

function addOwner(data) {
  return new Promise(function (resolve) {
    var response = new common.response();
    if (!data.Profile.name) {
      response.success = false;
      response.message = 'Owner name is required';
      resolve(response);
    }
    else {
      //check if owner exists
      datacontext.owner.getOwner(data.Profile.primarykey).then(function (res) {
        if (res.success) {
          if (res.data && res.data.Rows.length > 0) {
            response.success = false;
            response.message = 'Owner exists';
            resolve(response);
          }
          else {
            datacontext.owner.addOwner(data).then(resolve);
          }
        }
        else {
          response.success = false;
          response.message = 'error';
          resolve(response);
        }
      });
    }
  });

}

function getOwner(data) {
  return new Promise(function (resolve) {
    var response = new common.response();
    if (!data.primarykey) {
      response.success = false;
      response.message = 'Owner primarykey is required';
      resolve(response);
    }
    else {
      datacontext.owner.getOwner(data.Profile.primarykey).then(resolve);
    }
  });

}