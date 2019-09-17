
var
  util = require("util"),
  // membership_dal = require("./membership_dal"),
  common = require("../../common"),
  appconfig = require('../../appconfig'),
  microdb = require('../../microdb')(appconfig.microdb_api_key)
  ;


exports.getByEmail = getByEmail;
exports.createMembership = createMembership;

// exports.getMembershipById = getMembershipById;
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
      if (res.success && res.data.Rows.length > 0) {
        response.users = res.data.Rows;
      }

      response.success = true;
      resolve(response);
    }
    );
  });
  // dal.membership.getMembershipByEmail(email, function (response) {
  //   cb(response);
  // });
}

function createMembership(user) {
  return new Promise((resolve) => {
    var row = microdb.Tables.membership.addRow();
    var keys = Object.keys(user);
    for (var i = 0; i < keys.length; i++) {
      var col = keys[i];
      row[col].Value = user[col];
    }

    microdb.Tables.membership.save(row).then(function (saveres) {
      var response = new common.response();
      if(saveres.success && saveres.data && saveres.data.addedRows){
        response.UserId = saveres.data.addedRows[0].insertId;
      }
      response.success = true;
      resolve(response);
    }
    );
  });
  // dal.membership.createMembership(userInfo, function (response) {
  //   cb(response);
  // });
}


function membershipEmailConfirm(req, cb) {

  dal.membership.membershipEmailConfirm(req, function (response) {
    var acct = {};
    acct.MembershipId = response.MembershipId;
    acct.AccountName = 'My Account';
    dal.account.Create(acct, function (crtRes) {
      if (crtRes.success && crtRes.HasAccount) {
        cb(response);
        return;
      }
    });
  });
}

function getMembershipById(id, cb) {
  dal.membership.getMembershipById(id, function (response) {
    cb(response);
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
