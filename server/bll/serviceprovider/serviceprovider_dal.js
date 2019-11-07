/*
SP SPECIFIC DATA ACCESS
*/


var
  util = require("util"),
  common = require("../../common"),
  env = require('node-env-file'),
  bll = require('../index'),
  bcrypt = require('bcryptjs'),
  uuidV4 = require('uuid/v4')
  ;

env('./envVars.txt');
var microdb = require('microdb-api')(process.env.MICRODB_APIKEY);

exports.getByAccountId = getByAccountId;
exports.SaveProfile = SaveProfile;
exports.GetAll = GetAll;
exports.AddSP = AddSP;
exports.DeleteSP = DeleteSP;

function getByAccountId(id) {
  return new Promise((resolve) => {
    microdb.Tables.serviceprovider.get({ 'accountid': id }).then(function (res) {
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
  return new Promise((resolve) => {
    data.Profile.primarykey = data.AccountInfo.primarykey;
    microdb.Tables.serviceprovider.saveUpdate(data.Profile).then(function (saveres) {
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

function AddSP(data) {
  return new Promise((resolve) => {
    var response = new common.response();
    microdb.Tables.serviceprovider.saveNew(data.Profile).then(function (saveres) {
      if (saveres.success && saveres.data && saveres.data.addedRows) {
        response.success = true;
        response.spid = saveres.data.addedRows[0].insertId;
      }
      else {
        response.success = false;
      }
      resolve(response);
      return;
    });
  });
}


function GetAll() {
  return new Promise((resolve) => {
    microdb.Tables.serviceprovider.get().then(function (res) {
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


function DeleteSP(data) {
  // var data = {
  //   primarykey: req.body.data.spkey,
  //   userid: req.User.accountid
  // };

  return new Promise((resolve) => {
    delete data.userid;
    microdb.Tables.serviceprovider.saveDelete(data).then(function (saveres) {
      var response = new common.response();
      response.success = true;
      if (saveres.success && saveres.data && saveres.data.deletedRows) {
        response.success = true;
      }
      else {
        response.success = false;
      }
      resolve(response);
    });
  });
}