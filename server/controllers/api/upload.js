var
  bll = require("../../bll"),
  logger = require('../../common/logger'),
  util = require("util"),
  passportConf = require('../../config/passport'),
  _ = require('lodash'),
  common = require("../../common"),
  multer = require('multer')
  ;

var uploadHandlerReportTemplate = multer({ dest: __dirname });
// var uploadHandlerReportTemplate=multer();  // if we want to use streaming 

exports.init = function (app) {
  app.post('/upload', passportConf.isAuthenticated, uploadHandlerReportTemplate.array('thefile'), OnUpload);
};

function OnUpload(req, res, next) {

  //todo: add validation
  //var response = new common.response();
  //var filecounter = 0;

  var data = {};
  data.File = req.body.FileName;
  data.FileType = req.body.FileType;
  // data.AccountInfo = req.User.AccountInfo;
  // bll.owner.SaveProfile(data).then(function (bllRes) {
  //   res.status(200).send(bllRes);
  // });


  // var data = {
  //   DbId: req.body.DbId,
  //   FileName: req.body.FileName,
  //   FolderId:req.body.FolderId,
  //   FileType:req.body.FileType,
  //   User: req.User
  // };

  if (req.files && req.files.length > 0) {
    for (var x in req.files) {
      //var buffer = req.files[x].buffer;   //if we switch to buffers only and not write temp file to disk
      data.File = req.files[x].buffer;
      data.OriginalName = req.files[x].originalname;

      // if (req.body.FileId) {
      //   data.FileId = req.body.FileId;
      //   bll.files.FileUpdate(data, function (templateUpdateRes) {
      //     logger.log('bll.files.FileUpdate with file done');
      //     //res.status(200).send(outdata);
      //     //response.success = true;
      //     res.status(200).send(templateUpdateRes);
      //     return;
      //   });
      // }
      // else {
      //   bll.files.FileInsert(data, function (tempInsertRes) {
      //     logger.log('bll.files.FileInsert done');
      //     //res.status(200).send(outdata);
      //     //response.success = true;
      //     res.status(200).send(tempInsertRes);
      //     return;
      //   });
      // }
    }
    var response = new common.response();
    response.success=true;
    res.status(200).send(response);
  }
  // else if (req.body.FileId) {
    // data.FileId = req.body.FileId;
    // bll.files.FileUpdate(data, function (templateUpdateRes) {
    //   res.status(200).send(templateUpdateRes);
    //   return;
    // });
  // }

}

