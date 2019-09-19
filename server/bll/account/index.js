
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
// exports.ChangePassword = ChangePassword;


function SaveProfile(req) {
  return new Promise((resolve) => {
    // var row = microdb.Tables.membership.addRow();
    // var keys = Object.keys(user);
    // for (var i = 0; i < keys.length; i++) {
    //   var col = keys[i];
    //   row[col].Value = user[col];
    // }

    // microdb.Tables.membership.save(row).then(function (saveres) {
      var response = new common.response();
      response.user=req;
      // if(saveres.success && saveres.data && saveres.data.addedRows){
      //   response.UserId = saveres.data.addedRows[0].insertId;
      //   response.success = true;
      // }
      // else{
      //   response.success = false;
      // }
      resolve(response);
    // }
    // );
  });

  // dal.account.GetByOwnerId(req.OwnerMembershipId, function (canRes) {
  //   if (canRes.success && canRes.HasAccount) {
  //     dal.account.SaveProfile(req).then(function (getRes) {
  //       if (getRes.success) {
  //         // log('SaveProfile getRes= '+util.inspect(getRes));
  //         saveProfileCB(getRes);
  //         return;
  //       }
  //       else {
  //         response.error = errors.NO_ACCESS;
  //         response.success = false;
  //         saveProfileCB(response);
  //         return;
  //       }
  //     });
  //   }
  //   else {
  //     response.error = errors.NO_ACCESS;
  //     response.success = false;
  //     saveProfileCB(response);
  //     return;
  //   }
  // });

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