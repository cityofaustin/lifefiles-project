var
  bll = require("../../bll"),
  logger = require('../../common/logger'),
  util = require("util"),
  passportConf = require('../../config/passport'),
  _ = require('lodash'),
  common = require("../../common")
  ;


exports.init = function (app) {
  app.post('/administrator/save', passportConf.isAuthenticated, SaveProfile);

};

function SaveProfile(req, res, next) {
  var data = {};
  data.Profile = req.body.data;
  data.OwnerAccountId = req.User.accountid;
  bll.administrator.SaveProfile(data).then(function (bllRes) {
    res.status(200).send(bllRes);
  });
}

