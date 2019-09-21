
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
exports.SaveProfile = SaveProfile;
exports.DeleteAccount=DeleteAccount;

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


function SaveProfile(data) {
  return new Promise((resolve) => {
    data.Profile.primarykey = data.OwnerMembershipId;
    microdb.Tables.membership.saveUpdate(data.Profile).then(function (saveres) {
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
    microdb.Tables.membership.saveDelete(data).then(function (saveres) {
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
