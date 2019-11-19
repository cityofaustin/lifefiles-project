/*
OWNER SPECIFIC BUSINESS LOGIC
*/

var
  owner_dal = require('./owner_dal'),
  common = require("../../common"),
  env = require('node-env-file'),
  permanent = require('../../services/permanent')
  ;

env('./envVars.txt');
var microdb = require('microdb-api')(process.env.MICRODB_APIKEY);

exports.getByAccountId = getByAccountId;
exports.saveProfile = saveProfile;
exports.saveDocument = saveDocument;
exports.getDocs = getDocs;
exports.getFile = getFile;
exports.getAll = getAll;
exports.addOwner = addOwner;
exports.getOwner = getOwner;

function getByAccountId(id) {
  return owner_dal.getByAccountId(id);
}


function saveProfile(data) {
  return owner_dal.saveProfile(data);
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

    //for saving to microdb
    var doc = {
      documentname: data.FileName,
      file: new microdb.File(data.fileInfo)
    };
    if (data.ownerkey > 0) {
      doc.ownerid = data.ownerkey; // is someone posting on owners behalf
    }
    else {
      doc.ownerid = data.User.AccountInfo.primarykey; //is owner posting file
    }
    owner_dal.saveDocument(doc).then(resolve);

    //for saving to permanent

    // var ownerpk = data.ownerkey > 0 ? data.ownerkey : data.User.AccountInfo.primarykey;

    // microdb.Tables.owner.get({ "primarykey": ownerpk }).then(function (geto) {
    //   if (!geto.success || geto.data && geto.data.Rows.length < 1) {
    //     response.success = false;
    //     response.message = 'no owner found';
    //     resolve(response);
    //   }
    //   else {
    //     var owner = geto.data.Rows[0];
    //     if (!owner.permanent_archive_number) {
    //       response.success = false;
    //       response.message = 'no permanent archive number found for owner';
    //       resolve(response);
    //     }
    //     else {
    //       var doc = {
    //         file: new permanent.File(data.fileInfo),
    //         archive_number: owner.permanent_archive_number,
    //         originalname: data.fileInfo.originalname,
    //         filehandle: data.fileInfo.filename
    //       };
    //       owner_dal.saveDocument(doc).then(resolve);
    //     }
    //   }
    // });


  });

}

function getDocs(data) {
  return owner_dal.getDocs(data);
}

function getFile(data) {
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

function getAll() {
  //check your business rules is current user can perform action
  return owner_dal.getAll();
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
      microdb.Tables.owner.get(data.Profile).then(function (res) {
        if (res.success) {
          if (res.data && res.data.Rows.length > 0) {
            response.success = false;
            response.message = 'Owner exists';
            resolve(response);
          }
          else {
            owner_dal.addOwner(data).then(resolve);
          }
        }
        else {
          // var err = res.error;
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
      owner_dal.getOwner(data).then(resolve);
    }
  });

}