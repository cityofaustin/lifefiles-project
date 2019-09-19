var
  bll = require("../../../bll"),
  logger = require('../../../common/logger'),
  util = require("util"),
  passportConf = require('../../../config/passport'),
  _ = require('lodash'),
  common = require("../../../common")
  ;


exports.init = function (app) {
  app.post('/membership/save', passportConf.isAuthenticated, SaveProfile);
  // app.post('/membership/changepassword', passportConf.isAuthenticated, ChangePassword);
};

function SaveProfile(req, res, next) {
  var data = {};
  data.Profile = req.body.data;
  data.OwnerMembershipId = req.User.membershipid;
  bll.membership.SaveProfile(data).then(function (bllRes) {
    res.status(200).send(bllRes);
  });
}

// function ChangePassword(req, res, next) {
//   var data = {};
//   data.Email = req.body.RequestData.data[0].Email;
//   data.OldPassword = req.body.RequestData.data[0].OldPassword;
//   data.NewPassword = req.body.RequestData.data[0].NewPassword;
//   data.ConfirmPassword = req.body.RequestData.data[0].ConfirmPassword;
//   data.OwnerMembershipId = req.User.MembershipId;
//   bll.account.ChangePassword(data, function (bllRes) {
//     res.status(200).send(bllRes);
//   });
// }

