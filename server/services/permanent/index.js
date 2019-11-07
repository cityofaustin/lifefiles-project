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
      get: '/archive/get',
      insert: '/archive/insert',
      update: '/archive/update',
      delete: '/archive/delete',
      fileget: '/archive/getfile',
      fileadd: '/archive/addfile'
    }
  };

  this.archiveGet = archiveGet;
  this.archiveInsert = archiveInsert;
  this.archiveUpdate = archiveUpdate;
  this.archiveDelete = archiveDelete;
  this.archiveFileGet = archiveFileGet;
  this.archiveFileAdd = archiveFileAdd;


  function init() {
    // getTables().then(function (gtRes) {
    //   if (!gtRes.success) {
    //     app_instance.emit(apievents.InitFailed);
    //   }
    //   else {
    //     app_instance.Init = true;
    //     app_instance.emit(apievents.init);
    //   }
    // });
  }


  function archiveGet(data) {
    var req = prepRequest(data, true);
    return postMsg(routes.archive.get, req);
  }

  function archiveInsert(data) {
    var req = prepRequest(data, true);
    return postMsg(routes.archive.insert, req);
  }

  function archiveUpdate(data) {
    var req = prepRequest(data, true);
    return postMsg(routes.archive.update, req);
  }

  function archiveDelete(data) {
    var req = prepRequest(data, true);
    return postMsg(routes.archive.delete, req);
  }

  function archiveFileGet(data) {
    var req = prepRequest(data, true);
    return postMsg(routes.archive.fileget, req);
  }

  function archiveFileAdd(data) {
    var req = prepRequest(data, true);
    return postMsg(routes.archive.fileadd, req);
  }

  function postMsg(route, msg) {

    if (!_API_KEY) {
      throw 'API_KEY is required';
    }
    return new Promise(function (resolve) {
      var clientResponse = new Response();
      var url = process.env.NODE_ENV == 'local' ? 'http://localhost:9001' : 'https://api.permanent.org:443/';
      url = url + route;

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
      // && msg.data[0].constructor.name == 'TableRow'

      formData = { payload: msg };
      var keys = Object.keys(formData.payload.data[0]);
      var prop;
      for (var di = 0; di < keys.length; di++) {
        prop = keys[di];
        if (formData.payload.data[0][prop].File) {
          var ff = formData.payload.data[0][prop].File;
          // formData.payload.data[0][prop] = { Value: '', FileMap: ff.fileInfo.filename, IsFile: '1' };
          var sss = formData.payload.data[0][prop];
          formData[ff.fileInfo.filename] = {
            'value': fs.createReadStream(ff.fileInfo.path),
            'options': {
              'filename': ff.fileInfo.filename,
              'contentType': ff.fileInfo.mimetype
            }
          };
          delete formData.payload.data[0][prop].File;
        }
      }
    }

    if (formData) {
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

    if (!Array.isArray(data)) {
      data = [data];
    }
    var req = new Request();
    // for (var index = 0; index < data.length; index++) {
    //   var element = data[index];
    //   var row = getEmptyRow();
    //   row = maprows(row, element);

    //   req.data.push(row);
    // }
    req.data.push(data);
    return req;
  }

  function maprows(row, data) {
    var rowkeys = Object.keys(row);
    var datakeys = Object.keys(data);

    //only use the columns given by client
    for (var rk = 0; rk < rowkeys.length; rk++) {
      var col = rowkeys[rk];
      if (!data.hasOwnProperty(rowkeys[rk])) {
        delete row[rowkeys[rk]];
      }
    }

    for (var i = 0; i < datakeys.length; i++) {
      var col2 = datakeys[i];
      if (row.hasOwnProperty(col2)) {
        if (data[col2] instanceof Microdb.prototype.File) {
          row[col2].File = data[col2];
          row[col2].FileMap = {
            filename: data[col2].fileInfo.filename,
            originalname: data[col2].fileInfo.originalname,
            fieldname: data[col2].fileInfo.fieldname
          };
        }
        else {
          row[col2].Value = data[col2];
        }

      }
    }
    if (data.primarykey && data.primarykey > 0) {
      row.primarykey.Value = data.primarykey;
    }
    return row;
  }



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