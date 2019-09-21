var
  bll = require("../../../bll"),
  logger = require('../../../common/logger'),
  util = require("util"),
  passportConf = require('../../../config/passport'),
  _ = require('lodash'),
  common = require("../../../common")
  ;


exports.init = function (app) {
  app.post('/account/save', passportConf.isAuthenticated, SaveProfile);
  app.post('/account/delete', passportConf.isAuthenticated, DeleteAccount);
  // app.post('/account/changepassword', passportConf.isAuthenticated, ChangePassword);
};

function SaveProfile(req, res, next) {
  var data = {};
  data.Profile = req.body.data;
  data.OwnerAccountId = req.User.accountid;
  bll.account.SaveProfile(data).then(function (bllRes) {
    res.status(200).send(bllRes);
  });
}

function DeleteAccount(req, res, next) {
  //FOR DEMO PURPOSES ONLY...WONT USE IN PRODUCTION
  var data = {};
  // data.Profile = req.body.data;
  data.primarykey = req.User.accountid;
  bll.account.DeleteAccount(data).then(function (bllRes) {
    res.status(200).send(bllRes);
  });
}


// function ChangePassword(req, res, next) {
//   var data = {};
//   data.Email = req.body.RequestData.data[0].Email;
//   data.OldPassword = req.body.RequestData.data[0].OldPassword;
//   data.NewPassword = req.body.RequestData.data[0].NewPassword;
//   data.ConfirmPassword = req.body.RequestData.data[0].ConfirmPassword;
//   data.OwnerAccountId = req.User.AccountId;
//   bll.account.ChangePassword(data, function (bllRes) {
//     res.status(200).send(bllRes);
//   });
// }

