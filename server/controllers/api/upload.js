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
  //todo: add validation
  var response = new common.response();

  if (!req.files) {
    response.success = false;
    res.status(200).send(response);
    return;
  }


  for (var x = 0; x < req.files.length; x++) {
    var data = {
      FileName: req.body.FileName,
      FileType: req.body.FileType,
      MIMEType: req.body.MIMEType,
      fileInfo: req.files[x],
      User: req.User
    };


    //if we switch to buffers only and not write temp file to disk
    // data.File = req.files[x].buffer;

    if (req.User.AccountInfo.userrole == 2) {
      //this is an owner posting a file...so we put it into ownerdocument table
      bll.owner.saveDocument(data).then(function (tempInsertRes) {
        if (!tempInsertRes.success) {
          logger.log('api.upload err ' + util.inspect(tempInsertRes));
          response.success = false;
        }
        else {
          response.addedRows = tempInsertRes.addedRows;
          response.filename = tempInsertRes.filename;
          response.originalname = tempInsertRes.originalname;
          response.success = true;
        }
        res.status(200).send(response);
        return;
      });
    }

  }


}


