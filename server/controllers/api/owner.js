var
  bll = require("../../bll"),
  logger = require('../../common/logger'),
  util = require("util"),
  passportConf = require('../../config/passport'),
  _ = require('lodash'),
  common = require("../../common")
  ;

exports.init = function (app) {
  app.post('/owner/save', passportConf.isAuthenticated, SaveProfile);
  app.post('/owner/getdocs', passportConf.isAuthenticated, GetDocs);
  app.post('/owner/getfile', passportConf.isAuthenticated, GetFile);
  app.post('/owner/getall', passportConf.isAuthenticated, OnGetAll);
  app.post('/owner/get', passportConf.isAuthenticated, OnGetOwner);

  // exports.getArchive = getArchive;
  // exports.insertArchive = insertArchive;
  // exports.updateArchive = updateArchive;
  // exports.deleteArchive = deleteArchive;
  // exports.getFile = getFile;
  // exports.addFile = addFile;

};

function SaveProfile(req, res, next) {
  var data = {};
  data.Profile = req.body.data;
  data.AccountInfo = req.User.AccountInfo;

  if (req.body.data.isnew) {
    bll.owner.addOwner(data).then(function (bllRes) {
      res.status(200).send(bllRes);
    });
  }
  else {
    bll.owner.saveProfile(data).then(function (bllRes) {
      res.status(200).send(bllRes);
    });
  }
}

function GetDocs(req, res, next) {
  var data = {
    ownerid: ''
  };

  if (req.body && req.body.data && req.body.data.ownerid) {
    data.ownerid = req.body.data.ownerid;
  }
  else {
    data.ownerid = req.User.AccountInfo.primarykey;
  }

  bll.owner.getDocs(data).then(function (bllRes) {
    res.status(200).send(bllRes);
  });
}

function GetFile(req, res, next) {
  var data = {
    primarykey: req.body.data.primarykey,
    thefile: req.body.data.thefile
  };
  bll.owner.getFile(data).then(function (bllRes) {
    res.status(200).send(bllRes);
  });
}

function OnGetAll(req, res, next) {
  bll.owner.getAll().then(function (bllRes) {
    res.status(200).send(bllRes);
  });
}

function OnGetOwner(req, res, next) {
  var data = {
    primarykey: req.body.data.primarykey,
  };
  bll.owner.getOwner(data).then(function (bllRes) {
    res.status(200).send(bllRes);
  });
}
