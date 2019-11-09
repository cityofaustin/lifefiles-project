var
  util = require("util"),
  eventEmitter = require('events').EventEmitter,
  request = require('request'),
  fs = require('fs')
  ;


function permanent() {

  if (!process.env.PERMANENTORG_APIKEY) {
    throw 'PERMANENTORG_APIKEY is required in envVars.txt';
  }

  var app_instance = this;
  var _API_KEY = process.env.PERMANENTORG_APIKEY;
  var apievents = {
    initfailed: 'permanent.initfailed',
    init: 'permanent.init'
  };

  this.Events = apievents;
  this.Init = false;

  var routes = {
    archive: {
      get: '/archive/get/',
      insert: '/archive/insert/',
      update: '/archive/update/',
      delete: '/archive/delete/',
      fileget: '/archive/getfile/',
      fileadd: '/archive/addfile/'
    }
  };

  this.createArchive = createArchive;

  this.getArchive = getArchive;
  this.updateArchive = updateArchive;
  this.deleteArchive = deleteArchive;
  this.getFile = getFile;
  this.addFile = addFile;


  function init() {
    
  }


  function getArchive(data) {
    var req = prepRequest(data, true);
    return postMsg(routes.archive.get, req);
  }

  function createArchive(data) {
    var req = prepRequest(data, true);
    return postMsg(routes.archive.insert, req);
  }

  function updateArchive(data) {
    var req = prepRequest(data, true);
    return postMsg(routes.archive.update, req);
  }

  function deleteArchive(data) {
    var req = prepRequest(data, true);
    return postMsg(routes.archive.delete, req);
  }

  function getFile(data) {
    var req = prepRequest(data, true);
    return postMsg(routes.archive.fileget, req);
  }

  function addFile(data) {
    var req = prepRequest(data, true);
    return postMsg(routes.archive.fileadd, req);
  }

  function postMsg(route, msg) {

    if (!_API_KEY) {
      throw 'API_KEY is required';
    }
    return new Promise(function (resolve) {
      var clientResponse = new Response();
      // var url = process.env.NODE_ENV == 'local' ? 'http://localhost:9002' : 'https://api.permanent.org:443/';
      // url = url + route;
      var url = 'http://localhost:9002'+ route;

      var reqOptions = {
        preambleCRLF: true,
        postambleCRLF: true,
        url: url
      };

      prepForm(reqOptions, msg);
      request.post(reqOptions, serverResponse);

      function serverResponse(err, httpRes, apiResponse) {
        if (err) {
          clientResponse.success = false;
          resolve(clientResponse);
          return;
        }

        if (httpRes.statusCode === 200) {
          var resObj = JSON.parse(apiResponse);
          clientResponse.message = resObj.message;
          clientResponse.success = resObj.success;
          clientResponse.data = resObj.data;
        }
        else {
          clientResponse.httpcode = httpRes.statusCode;
          clientResponse.success = false;

        }
        resolve(clientResponse);
      }
    });
  }

  function prepForm(reqOptions, msg) {
    var formData;
    var ismultipart = reqOptions.url.includes(routes.archive.fileadd);

    if (ismultipart && msg.data && msg.data.length > 0 ) {
      formData = { payload: msg };
      var keys = Object.keys(formData.payload.data[0]);
      var prop;
      for (var di = 0; di < keys.length; di++) {
        prop = keys[di];
        if (formData.payload.data[0][prop] instanceof permanent.prototype.File) {
          var file = formData.payload.data[0][prop];
          formData[file.fileInfo.filename] = {
            'value': fs.createReadStream(file.fileInfo.path),
            'options': {
              'filename': file.fileInfo.filename,
              'contentType': file.fileInfo.mimetype
            }
          };
          delete formData.payload.data[0][prop];
        }
      }

      formData.payload = JSON.stringify(formData.payload);
      formData.apiKey = _API_KEY;
      formData.isjson = '1';
      reqOptions.formData = formData;
    }
    else {
      reqOptions.form = {
        'payload': msg,
        'apiKey': _API_KEY
      };
    }

  }


  function prepRequest(data) {
    if (!data) {
      return data;
    }
    var req = new Request();
    req.data.push(data);
    return req;
  }

  // function maprows(row, data) {
  //   var rowkeys = Object.keys(row);
  //   var datakeys = Object.keys(data);

  //   //only use the columns given by client
  //   for (var rk = 0; rk < rowkeys.length; rk++) {
  //     var col = rowkeys[rk];
  //     if (!data.hasOwnProperty(rowkeys[rk])) {
  //       delete row[rowkeys[rk]];
  //     }
  //   }

  //   for (var i = 0; i < datakeys.length; i++) {
  //     var col2 = datakeys[i];
  //     if (row.hasOwnProperty(col2)) {
  //       if (data[col2] instanceof permanent.prototype.File) {
  //         row[col2].File = data[col2];
  //         row[col2].FileMap = {
  //           filename: data[col2].fileInfo.filename,
  //           originalname: data[col2].fileInfo.originalname,
  //           fieldname: data[col2].fileInfo.fieldname
  //         };
  //       }
  //       else {
  //         row[col2].Value = data[col2];
  //       }

  //     }
  //   }
  //   if (data.primarykey && data.primarykey > 0) {
  //     row.primarykey.Value = data.primarykey;
  //   }
  //   return row;
  // }



  function Request(data) {
    if (data && !Array.isArray(data)) {
      this.data = [data];
    }
    else {
      this.data = [];
    }
  }

  function Response(response) {
    this.success = '';
    this.error = '';
    this.message = '';
    this.data = '';

    if (response) {
      this.success = response.success;
      this.error = response.error;
    }
  }

  init();

}


permanent.prototype.File = function (info) {
  this.fileInfo = info;
};

util.inherits(permanent, eventEmitter);

module.exports = new permanent();