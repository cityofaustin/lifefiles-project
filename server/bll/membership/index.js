
var
  util = require("util"),
  // membership_dal = require("./membership_dal"),
  common = require("../../common"),
  appconfig = require('../../appconfig'),
  microdb = require('../../microdb')(appconfig.microdb_api_key)
  ;


exports.getByEmail = getByEmail;
// exports.getMembershipById = getMembershipById;
// exports.createMembership = createMembership;
// exports.membershipEmailConfirm = membershipEmailConfirm;
// exports.resetPasswordComplete = resetPasswordComplete;
// exports.UpdateLastLogin = UpdateLastLogin;
// exports.LockAccount = LockAccount;
// exports.UpdateBadAttempt = UpdateBadAttempt;
// exports.ClearBadAttempt = ClearBadAttempt;
// exports.getMembershipBy_PasswordRestCode = getMembershipBy_PasswordRestCode;

function getByEmail(email, cb) {

  return new Promise((resolve) => {
    // common.logger.log('microdb.Tables.membership ' + util.inspect(microdb.Tables.membership));
    microdb.Tables.membership.get({'email': email }).then(function (res) {
      var response = new common.response();
      resolve(response);
    }
    );
  });
  // dal.membership.getMembershipByEmail(email, function (response) {
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



function createMembership(userInfo, cb) {
  dal.membership.createMembership(userInfo, function (response) {
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
