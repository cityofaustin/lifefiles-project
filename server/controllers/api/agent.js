var
  bll = require("../../bll"),
  logger = require('../../common/logger'),
  util = require("util"),
  passportConf = require('../../config/passport'),
  _ = require('lodash'),
  common = require("../../common")
  ;


exports.init = function (app) {
  app.post('/agent/save', passportConf.isAuthenticated, SaveProfile);
  app.post('/agent/getall', passportConf.isAuthenticated, OnGetAll);
  // app.post('/agent/delete', passportConf.isAuthenticated, DeleteAccount);
  // app.post('/account/changepassword', passportConf.isAuthenticated, ChangePassword);
  app.post('/agent/getVerifiablePayload', passportConf.isAuthenticated, OnGetVerifiablePayload)
};

function SaveProfile(req, res, next) {
  var data = {};
  data.Profile = req.body.data;
  data.AccountInfo = req.User.AccountInfo;
  bll.agent.SaveProfile(data).then(function (bllRes) {
    res.status(200).send(bllRes);
  });
}

function OnGetAll(req,res,next) {
  bll.agent.GetAll().then(function (bllRes) {
    res.status(200).send(bllRes);
  });
}

// function DeleteAccount(req, res, next) {
//   //FOR DEMO PURPOSES ONLY...WONT USE IN PRODUCTION
//   var data = {};
//   // data.Profile = req.body.data;
//   data.primarykey = req.User.accountid;
//   bll.agent.DeleteAccount(data).then(function (bllRes) {
//     res.status(200).send(bllRes);
//   });
// }

function OnGetVerifiablePayload(req, res, next) {
  var data = {}
  data.Profile = req.body.data;
  data.AccountInfo = req.User.AccountInfo;
  console.log(req.body.data)
  bll.agent.getVerifiablePayload(data).then(function (bllRes) {
    res.status(200).send(bllRes);
  });
}

