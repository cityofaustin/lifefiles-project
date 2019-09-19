
var
  util = require("util"),
  common = require("../../common"),
  //  access = require("./access"),
  _ = require('lodash'),
  membership = require('../membership'),
  bcrypt = require('bcryptjs'),
  uuidV4 = require('uuid/v4'),
  moment = require('moment'),
  env = require('node-env-file')
  //  account_dal = require("./account_dal")
  ;

  env('./envVars.txt');
  var microdb = require('../../microdb')(process.env.MICRODB_MYPASS_DB_APIKEY)

exports.SaveProfile = SaveProfile;
// exports.ChangePassword = ChangePassword;


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


// function ChangePassword(req, chgPassCB) {
//   // log('calling ChangePassword');
//   var response = new common.response();
//   if (!req.OldPassword || req.NewPassword != req.ConfirmPassword) {
//     response.error = errors.NO_ACCESS;
//     response.success = false;
//     chgPassCB(response);
//     return;
//   }

//   membership.getMembershipByEmail(req.Email, function (getByEmailRes) {
//     if (getByEmailRes.success) {
//       // log('getByEmailRes' + util.inspect(getByEmailRes));
//       var isMatch = bcrypt.compareSync(req.OldPassword, getByEmailRes.Membership.Password);
//       // log('isMatch =' + isMatch);
//       if (!isMatch) {
//         //TODO: NEED TO LOCK ACCOUNT AFTER 5 ATTEMPTS
//         response.error = errors.NO_ACCESS;
//         response.success = false;
//         chgPassCB(response);
//         return;
//       }

//       //NewPassword
//       //ConfirmPassword

//       var salt = bcrypt.genSaltSync(5);
//       var passwordHash = bcrypt.hashSync(req.NewPassword, salt);
//       var newMatches = bcrypt.compareSync(req.NewPassword, passwordHash);

//       if (!newMatches) {
//         response.error = errors.NO_ACCESS;
//         response.success = false;
//         chgPassCB(response);
//         return;
//       }

//       var chgReq = {
//         OwnerMembershipId: req.OwnerMembershipId,
//         NewPassword: passwordHash
//       };

//       dal.account.ChangePassword(chgReq, function (getRes) {
//         if (getRes.success) {
//           //log('GetUserPrivileges getRes= '+util.inspect(getRes));
//           chgPassCB(getRes);
//           return;
//         }
//         else {
//           response.error = errors.NO_ACCESS;
//           response.success = false;
//           chgPassCB(response);
//           return;
//         }
//       });
//     }
//     else {
//       response.error = errors.NO_ACCESS;
//       response.success = false;
//       chgPassCB(response);
//       return;
//     }
//   });
// }