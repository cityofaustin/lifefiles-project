
var
  util = require("util"),
  common = require("../../common"),
//  access = require("./access"),
 _ = require('lodash'),
 membership = require('../membership'),
 bcrypt = require('bcryptjs'),
 uuidV4 = require('uuid/v4'),
 moment = require('moment')
//  account_dal = require("./account_dal")
;

exports.SaveProfile = SaveProfile;
exports.ChangePassword = ChangePassword;


function SaveProfile(req, saveProfileCB) {
  //log('SaveProfile= '+util.inspect(data));
  //log('SaveProfile');
  var response = new common.response();
  dal.account.GetByOwnerId(req.OwnerMembershipId, function (canRes) {
    if (canRes.success && canRes.HasAccount) {
      dal.account.SaveProfile(req).then(function (getRes) {
        if (getRes.success) {
          // log('SaveProfile getRes= '+util.inspect(getRes));
          saveProfileCB(getRes);
          return;
        }
        else {
          response.error = errors.NO_ACCESS;
          response.success = false;
          saveProfileCB(response);
          return;
        }
      });
    }
    else {
      response.error = errors.NO_ACCESS;
      response.success = false;
      saveProfileCB(response);
      return;
    }
  });

}

function ChangePassword(req, chgPassCB) {
  // log('calling ChangePassword');
  var response = new common.response();
  if (!req.OldPassword || req.NewPassword != req.ConfirmPassword) {
    response.error = errors.NO_ACCESS;
    response.success = false;
    chgPassCB(response);
    return;
  }

  membership.getMembershipByEmail(req.Email, function (getByEmailRes) {
    if (getByEmailRes.success) {
      // log('getByEmailRes' + util.inspect(getByEmailRes));
      var isMatch = bcrypt.compareSync(req.OldPassword, getByEmailRes.Membership.Password);
      // log('isMatch =' + isMatch);
      if (!isMatch) {
        //TODO: NEED TO LOCK ACCOUNT AFTER 5 ATTEMPTS
        response.error = errors.NO_ACCESS;
        response.success = false;
        chgPassCB(response);
        return;
      }

      //NewPassword
      //ConfirmPassword

      var salt = bcrypt.genSaltSync(5);
      var passwordHash = bcrypt.hashSync(req.NewPassword, salt);
      var newMatches = bcrypt.compareSync(req.NewPassword, passwordHash);

      if (!newMatches) {
        response.error = errors.NO_ACCESS;
        response.success = false;
        chgPassCB(response);
        return;
      }

      var chgReq = {
        OwnerMembershipId: req.OwnerMembershipId,
        NewPassword: passwordHash
      };

      dal.account.ChangePassword(chgReq, function (getRes) {
        if (getRes.success) {
          //log('GetUserPrivileges getRes= '+util.inspect(getRes));
          chgPassCB(getRes);
          return;
        }
        else {
          response.error = errors.NO_ACCESS;
          response.success = false;
          chgPassCB(response);
          return;
        }
      });
    }
    else {
      response.error = errors.NO_ACCESS;
      response.success = false;
      chgPassCB(response);
      return;
    }
  });
}