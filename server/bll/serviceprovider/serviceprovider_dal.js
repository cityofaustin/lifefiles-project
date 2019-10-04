/*
SP SPECIFIC DATA ACCESS
*/


var
  util = require("util"),
  common = require("../../common"),
  env = require('node-env-file'),
  bll = require('../index'),
  bcrypt = require('bcryptjs'),
  uuidV4 = require('uuid/v4')
  ;

env('./envVars.txt');
var microdb = require('../../microdb')(process.env.MICRODB_MYPASS_DB_APIKEY);

exports.getByAccountId = getByAccountId;
exports.SaveProfile = SaveProfile;
exports.GetAll = GetAll;
exports.AddSP = AddSP;

function getByAccountId(id) {
  return new Promise((resolve) => {
    microdb.Tables.serviceprovider.get({ 'accountid': id }).then(function (res) {
      var response = new common.response();
      if (!res.success) {
        response.message = 'error attempting to get by accountid';
        response.success = false;
      }
      else {
        response.user = res.data && res.data.Rows ? res.data.Rows : [];
        response.success = true;
      }
      resolve(response);
    });
  });
}


function SaveProfile(data) {
  return new Promise((resolve) => {
    data.Profile.primarykey = data.AccountInfo.primarykey;
    microdb.Tables.serviceprovider.saveUpdate(data.Profile).then(function (saveres) {
      var response = new common.response();
      response.success = true;
      if (saveres.success && saveres.data && saveres.data.updatedRows) {
        response.success = true;
      }
      else {
        response.success = false;
      }
      resolve(response);
    });
  });
}

function AddSP(data) {
  return new Promise((resolve) => {
    // data.Profile.primarykey = data.AccountInfo.primarykey;
    // first_name last_name company_name address

    delete data.Profile.isnew;
    var response = new common.response();
    var emailchk = data.Profile.email.match(/^[a-z0-9!#$%&'*+/=?^_`{|}~.-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i);
    var errors = !data.Profile.email || !data.Profile.first_name || !data.Profile.last_name ||
      !emailchk || !data.Profile.company_name;

    if (errors) {
      response.success = false;
      response.error = 'all data required';
      resolve(response);
      return;
    }

    bll.account.getByEmail(data.Profile.email).then(function (getbyemres) {
      if (!getbyemres.success) {
        response.success = false;
        response.error = 'error';
        resolve(response);
        return;
      }
      else if (getbyemres.users && getbyemres.users.length > 0) {
        response.success = false;
        response.error = 'Email taken';
        resolve(response);
        return;
      }
      else {
        var salt = bcrypt.genSaltSync(5);
        var passwordHash = bcrypt.hashSync(uuidV4(), salt);
        var emailcode = uuidV4();  //does not exist in db yet but can be used if generating an email
        var newaccount = {
          email: data.Profile.email,
          first_name: data.Profile.first_name,
          last_name: data.Profile.last_name,
          password: passwordHash,
          account_role: 3  //service provider role in db
        };

        bll.account.createAccount(newaccount).then(function (createres) {
          if (createres.success) {
            data.Profile.accountid = createres.UserId.toString();
            data.Profile.name = data.Profile.first_name + ' ' + data.Profile.last_name;

            microdb.Tables.serviceprovider.saveNew(data.Profile).then(function (saveres) {
              if (saveres.success && saveres.data && saveres.data.addedRows) {
                response.success = true;
                response.spid = saveres.data.addedRows[0].insertId;
              }
              else {
                response.success = false;
              }
              resolve(response);
              return;
            });
           
          }
          else {
            response.success = false;
            response.error = 'Could not create account';
            resolve(response);
            return;
          }
        });
      }
    });
  });
}


function GetAll() {
  return new Promise((resolve) => {
    microdb.Tables.serviceprovider.get().then(function (res) {
      var response = new common.response();
      if (!res.success) {
        response.message = 'error attempting to get by all';
        response.success = false;
      }
      else {
        response.Rows = res.data && res.data.Rows ? res.data.Rows : [];
        response.success = true;
      }
      resolve(response);
    });
  });
}
