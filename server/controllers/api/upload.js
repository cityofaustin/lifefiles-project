var
  bll = require("../../bll"),
  logger = require('../../common/logger'),
  util = require("util"),
  passportConf = require('../../config/passport'),
  _ = require('lodash'),
  common = require("../../common"),
  multer = require('multer')
  ;

var uploadHandlerReportTemplate = multer({ dest: __dirname + '../../uploadtmp' });
// var uploadHandlerReportTemplate=multer();  // if we want to use streaming 

exports.init = function (app) {
  app.post('/upload', passportConf.isAuthenticated, uploadHandlerReportTemplate.array('thefile'), OnUpload);
};

function OnUpload(req, res, next) {

  //todo: add validation
  var response = new common.response();
  if (req.files && req.files.length > 0) {
    for (var x = 0; x < req.files.length; x++) {
      var data = {
        FileName: req.body.FileName,
        FileType: req.body.FileType,
        MIMEType: req.body.MIMEType,
        OriginalName: req.files[x].originalname,
        User: req.User
      };

      // req.User.AccountInfo.userrole // tells us their role so we know how to handle the file

      var dd = '';
      //if we switch to buffers only and not write temp file to disk
      // data.File = req.files[x].buffer;  

      //   bll.files.FileInsert(data, function (tempInsertRes) {
      //     logger.log('bll.files.FileInsert done');
      //     //res.status(200).send(outdata);
      //     //response.success = true;
      //     res.status(200).send(tempInsertRes);
      //     return;
      //   });
      // }
    }
    response.success = true;
    res.status(200).send(response);
  }


}

