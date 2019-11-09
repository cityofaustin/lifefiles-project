var
  bll = require("../../bll"),
  logger = require('../../common/logger'),
  util = require("util"),
  passportConf = require('../../config/passport'),
  _ = require('lodash'),
  common = require("../../common"),
  multer = require('multer')
  ;

var theFilePath = __dirname + '../../uploadtmp';
var uploadHandlerReportTemplate = multer({ dest: theFilePath });
// var uploadHandlerReportTemplate = multer();  // if we want to use streaming 

exports.init = function (app) {
  app.post('/upload', passportConf.isAuthenticated, uploadHandlerReportTemplate.array('thefile'), OnUpload);
};

function OnUpload(req, res, next) {
  var response = new common.response();
  var isvalid = false;

  if (!req.files) {
    response.success = false;
    res.status(200).send(response);
    return;
  }

  var data = {};
  if (req.User.AccountInfo.userrole == 2) {
    //an owner posting file
    data.User = req.User;
    isvalid = true;
  }
  else if (req.User.AccountInfo.userrole == 3 && req.body.ownerkey > 0) {
    //a service provider posting file
    data.ownerkey = req.body.ownerkey;
    isvalid = true;
  }

  if (!isvalid) {
    response.success = false;
    res.status(200).send(response);
    return;
  }

  for (var x = 0; x < req.files.length; x++) {
    data.FileName = req.body.FileName;
    data.FileType = req.body.FileType;
    data.MIMEType = req.body.MIMEType;
    data.fileInfo = req.files[x];  //if we switch to buffers only // data.File = req.files[x].buffer;

    bll.owner.saveDocument(data).then(function (tempInsertRes) {
      if (!tempInsertRes.success) {
        logger.log('api.upload err ' + util.inspect(tempInsertRes));
        response.success = false;
      }
      else {
        //need to remove file from tmp folder
        response.addedRows = tempInsertRes.addedRows;
        response.filename = tempInsertRes.filename;
        response.originalname = tempInsertRes.originalname;
        response.success = true;
        res.status(200).send(response);
        return;
      }
    });
  }

}


