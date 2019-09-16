var
  bll = require("../../../bll"),
  logger = require('../../../common/logger'),
  util = require("util"),
  passportConf = require('../../../config/passport'),
  _ = require('lodash'),
  common = require("../../../common")
  ;


exports.init = function (app) {
  app.post('/api/account/saveprofile', passportConf.isAuthenticated, SaveProfile);
  app.post('/api/account/changepassword', passportConf.isAuthenticated, ChangePassword);
};

function SaveProfile(req, res, next) {
  var data = {};
  data.Profile = req.body.RequestData.data[0].Profile;
  data.OwnerMembershipId = req.User.MembershipId;
  bll.account.SaveProfile(data, function (bllRes) {
    res.status(200).send(bllRes);
  });
}

function ChangePassword(req, res, next) {
  var data = {};
  data.Email = req.body.RequestData.data[0].Email;
  data.OldPassword = req.body.RequestData.data[0].OldPassword;
  data.NewPassword = req.body.RequestData.data[0].NewPassword;
  data.ConfirmPassword = req.body.RequestData.data[0].ConfirmPassword;
  data.OwnerMembershipId = req.User.MembershipId;
  bll.account.ChangePassword(data, function (bllRes) {
    res.status(200).send(bllRes);
  });
}



// function log(msg) {
//   logger.log('account Controller ' + msg);
// }