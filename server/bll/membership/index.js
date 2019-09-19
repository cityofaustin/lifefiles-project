
var
  util = require("util"),
  // membership_dal = require("./membership_dal"),
  common = require("../../common"),
  appconfig = require('../../appconfig'),
  env = require('node-env-file')
   ;

  env('./envVars.txt');
  var microdb = require('../../microdb')(process.env.MICRODB_MYPASS_DB_APIKEY)

exports.getByEmail = getByEmail;
exports.createMembership = createMembership;
exports.getMembershipById = getMembershipById;

// exports.membershipEmailConfirm = membershipEmailConfirm;
// exports.resetPasswordComplete = resetPasswordComplete;
// exports.UpdateLastLogin = UpdateLastLogin;
// exports.LockAccount = LockAccount;
// exports.UpdateBadAttempt = UpdateBadAttempt;
// exports.ClearBadAttempt = ClearBadAttempt;
// exports.getMembershipBy_PasswordRestCode = getMembershipBy_PasswordRestCode;

function getByEmail(email) {
  return new Promise((resolve) => {
    microdb.Tables.membership.get({ 'email': email }).then(function (res) {
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

function createMembership(user) {
  return new Promise((resolve) => {
    // var row = microdb.Tables.membership.addRow();
    // var keys = Object.keys(user);
    // for (var i = 0; i < keys.length; i++) {
    //   var col = keys[i];
    //   row[col].Value = user[col];
    // }

    microdb.Tables.membership.saveNew(user).then(function (saveres) {
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
  // dal.membership.createMembership(userInfo, function (response) {
  //   cb(response);
  // });
}

function getMembershipById(id) {
  return new Promise((resolve) => {
    microdb.Tables.membership.get({'primarykey': id }).then(function (res) {
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



function resetPasswordComplete(req) {
  return dal.membership.resetPasswordComplete(req);
}

function getMembershipBy_PasswordRestCode(req) {
  return dal.membership.getMembershipBy_PasswordRestCode(req);
}


function UpdateLastLogin(membershipId) {
  return dal.membership.UpdateLastLogin(membershipId);
}

function LockAccount(membershipId) {
  return dal.membership.LockAccount(membershipId);
}

function UpdateBadAttempt(membershipId) {
  return dal.membership.UpdateBadAttempt(membershipId);
}

function ClearBadAttempt(membershipId) {
  return dal.membership.ClearBadAttempt(membershipId);
}
