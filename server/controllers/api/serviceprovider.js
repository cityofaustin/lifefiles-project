var
  bll = require("../../bll"),
  logger = require('../../common/logger'),
  util = require("util"),
  passportConf = require('../../config/passport'),
  _ = require('lodash'),
  common = require("../../common")
  ;


exports.init = function (app) {
  app.post('/serviceprovider/save', passportConf.isAuthenticated, SaveProfile);
  app.post('/serviceprovider/getall', passportConf.isAuthenticated, OnGetAll);
  // app.post('/serviceprovider/delete', passportConf.isAuthenticated, DeleteAccount);
};

function SaveProfile(req, res, next) {
  var data = {};
  data.Profile = req.body.data;
  data.AccountInfo = req.User.AccountInfo;

  if (req.body.data.isnew) {
    bll.serviceprovider.AddSP(data).then(function (bllRes) {
      res.status(200).send(bllRes);
    });
  }
  else {
    bll.serviceprovider.SaveProfile(data).then(function (bllRes) {
      res.status(200).send(bllRes);
    });
  }

}


function OnGetAll(req, res, next) {
  bll.serviceprovider.GetAll().then(function (bllRes) {
    res.status(200).send(bllRes);
  });
}

// function DeleteAccount(req, res, next) {
//   //FOR DEMO PURPOSES ONLY...WONT USE IN PRODUCTION
//   var data = {};
//   // data.Profile = req.body.data;
//   data.primarykey = req.User.accountid;
//   bll.serviceprovider.DeleteAccount(data).then(function (bllRes) {
//     res.status(200).send(bllRes);
//   });
// }


