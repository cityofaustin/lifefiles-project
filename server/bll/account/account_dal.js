/*
ACCOUNT SPECIFIC DATA ACCESS
*/

var
  util = require("util"),
  common = require("../../common"),
  env = require('node-env-file')
   ;

   env('./envVars.txt');
   var microdb = require('microdb-api')(process.env.MICRODB_MYPASS_DB_APIKEY);


exports.getByEmail = getByEmail;
exports.createAccount = createAccount;
exports.getAccountById = getAccountById;
exports.SaveProfile = SaveProfile;
exports.DeleteAccount=DeleteAccount;
exports.resetPasswordComplete = resetPasswordComplete;
exports.UpdateLastLogin = UpdateLastLogin;
exports.LockAccount = LockAccount;
exports.UpdateBadAttempt = UpdateBadAttempt;
exports.ClearBadAttempt = ClearBadAttempt;
exports.getAccountBy_PasswordRestCode = getAccountBy_PasswordRestCode;



function getByEmail(email) {
  return new Promise((resolve) => {
    microdb.Tables.account.get({ 'email': email }).then(function (res) {
      var response = new common.response();
      if (!res.success){
        response.message='error attempting to get by email';
        response.success = false;
      }
      else {
        response.users = res.data && res.data.Rows? res.data.Rows:[];
        response.success = true;
      }
      resolve(response);
    });
  });
}



function createAccount(user) {
  return new Promise((resolve) => {
      microdb.Tables.account.saveNew(user).then(function (saveres) {
      var response = new common.response();
      if(saveres.success && saveres.data && saveres.data.addedRows){
        response.UserId = saveres.data.addedRows[0].insertId;
        response.success = true;
      }
      else{
        response.success = false;
      }
      resolve(response);
    }
    );
  });

}

function getAccountById(id) {
  return new Promise((resolve) => {
    microdb.Tables.account.get({'primarykey': id }).then(function (res) {
      var response = new common.response();
      if (!res.success){
        response.message='error attempting to get by primarykey';
        response.success = false;
      }
      else {
        response.users = res.data && res.data.Rows? res.data.Rows:[];
        response.success = true;
      }
      resolve(response);
    });
  });
}


function SaveProfile(data) {
  return new Promise((resolve) => {
    data.Profile.primarykey = data.OwnerAccountId;
    microdb.Tables.account.saveUpdate(data.Profile).then(function (saveres) {
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

function DeleteAccount(data) {
  //FOR DEMO PURPOSES ONLY...WONT USE IN PRODUCTION
  return new Promise((resolve) => {
    microdb.Tables.account.saveDelete(data).then(function (saveres) {
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



function resetPasswordComplete(req) {
  throw 'Not implemented yet';
}

function getAccountBy_PasswordRestCode(req) {
  throw 'Not implemented yet';
}


function UpdateLastLogin(accountId) {
  throw 'Not implemented yet';
}

function LockAccount(accountId) {
  throw 'Not implemented yet';
}

function UpdateBadAttempt(accountId) {
  throw 'Not implemented yet';
}

function ClearBadAttempt(accountId) {
  throw 'Not implemented yet';
}
