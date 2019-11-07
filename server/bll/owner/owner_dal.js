/*
OWNER SPECIFIC DATA ACCESS
*/


var
  util = require("util"),
  common = require("../../common"),
  env = require('node-env-file')
  ;

env('./envVars.txt');
var microdb = require('microdb-api')(process.env.MICRODB_APIKEY);

exports.getByAccountId = getByAccountId;
exports.SaveProfile = SaveProfile;
exports.saveDocument = saveDocument;
exports.getDocs = getDocs;
exports.getFile = getFile;
exports.getAll=GetAll;

function getByAccountId(id) {
  return new Promise(function(resolve)  {
    microdb.Tables.owner.get({ 'accountid': id }).then(function (res) {
      var response = new common.response();
      if (!res.success) {
        response.message = 'error attempting to get by accountid';
        response.success = false;
      }
      else {
        response.user = res.data && res.data.Rows ? res.data.Rows : [];
        response.success = true;
      }
      resolve(response);
    });
  });
}


function SaveProfile(data) {
  return new Promise(function(resolve)  {
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

function saveDocument(data) {
  return new Promise(function(resolve)  {
    var response = new common.response();

    // var data = {
    //   FileName: req.body.FileName,
    //   FileType: req.body.FileType,
    //   MIMEType: req.body.MIMEType,
    //   fileInfo: req.files[x],
    //   User: req.User
    // };

    var doc = {
      ownerid: data.User.AccountInfo.primarykey, //ownerid
      documentname: data.FileName,
      thefile: new microdb.File(data.fileInfo)
    };

    microdb.Tables.ownerdocument.saveNew(doc).then(function (saveres) {
      response.success = true;
      if (saveres.success && saveres.data && saveres.data.addedRows) {
        response.success = true;
        response.addedRows = saveres.data.addedRows;
        response.originalname = saveres.data.originalname;
        response.filename = saveres.data.filename;

      }
      else {
        response.success = false;
      }
      resolve(response);
    });
  });
}

function getDocs(data) {
  return new Promise(function(resolve)  {
    var response = new common.response();
    microdb.Tables.ownerdocument.get(data).then(function (getres) {
      response.success = true;
      if (getres.success) {
        response.success = true;
        response.data = getres.data && getres.data.Rows ? getres.data.Rows : [];
      }
      else {
        response.success = false;
      }
      resolve(response);
    });
  });
}

function getFile(data) {
  return new Promise(function (resolve) {
    var response = new common.response();
    microdb.Tables.ownerdocument.getAttachment(data).then(function (getres) {
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
  });
}

function GetAll() {
  return new Promise(function(resolve) {
    microdb.Tables.owner.get().then(function (res) {
      var response = new common.response();
      if (!res.success) {
        response.message = 'error attempting to get by all';
        response.success = false;
      }
      else {
        response.data = res.data && res.data.Rows ? res.data.Rows : [];
        response.success = true;
      }
      resolve(response);
    });
  });
}