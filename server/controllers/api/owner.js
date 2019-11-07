var
  bll = require("../../bll"),
  logger = require('../../common/logger'),
  util = require("util"),
  passportConf = require('../../config/passport'),
  _ = require('lodash'),
  common = require("../../common"),
  multer = require('multer')
  ;

//IF WE DECIDE TO HANDLE FILE POSTS IN RESPECTIVE CONTROLLERS AND NOT USE A GENERICE UPLOAD SERVICE
//UNCOMMENT THE FOLLOWING CODE
// var theFilePath = __dirname + '../../uploadtmp';
// var uploadHandlerReportTemplate = multer({ dest: theFilePath });

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


  //IF WE DECIDE TO HANDLE FILE POSTS IN RESPECTIVE CONTROLLERS AND NOT USE A GENERICE UPLOAD SERVICE
  //UNCOMMENT THE FOLLOWING CODE
  // app.post('/owner/documentupload', passportConf.isAuthenticated, uploadHandlerReportTemplate.array('thefile'), OnUpload);

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
    ownerid: req.User.AccountInfo.primarykey
  };
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


//IF WE DECIDE TO HANDLE FILE POSTS IN RESPECTIVE CONTROLLERS AND NOT USE A GENERICE UPLOAD SERVICE
//UNCOMMENT THE FOLLOWING CODE

// function OnUpload(req, res, next) {
//   //todo: add validation
//   var response = new common.response();

//   if (!req.files) {
//     response.success = false;
//     res.status(200).send(response);
//     return;
//   }


//   for (var x = 0; x < req.files.length; x++) {
//     var data = {
//       FileName: req.body.FileName,
//       FileType: req.body.FileType,
//       MIMEType: req.body.MIMEType,
//       fileInfo: req.files[x],
//       User: req.User
//     };

//     // req.User.AccountInfo.userrole // tells us their role so we know how to handle the file
//     //if we switch to buffers only and not write temp file to disk
//     // data.File = req.files[x].buffer;

//     bll.owner.saveDocument(data).then(function (tempInsertRes) {
//       if (!tempInsertRes.success) {
//         logger.log('api.upload err ' + util.inspect(tempInsertRes));
//         response.success = false;
//       }
//       else {
//         response.success = true;
//       }
//       res.status(200).send(response);
//       return;
//     });
//   }
// }
