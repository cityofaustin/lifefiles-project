/*
SP SPECIFIC BUSINESS LOGIC
*/

var
  sp_dal = require('./serviceprovider_dal'),
  account = require('../account/account_bll'),
  common = require("../../common"),
  bcrypt = require('bcryptjs'),
  uuidV4 = require('uuid/v4')
  ;

exports.getByAccountId = getByAccountId;
exports.SaveProfile = SaveProfile;
exports.GetAll = GetAll;
exports.AddSP = AddSP;
exports.DeleteSP=DeleteSP;

function getByAccountId(id) {
  return sp_dal.getByAccountId(id);
}

function SaveProfile(data) {
  //check your business rules is current user can perform action
  return sp_dal.SaveProfile(data);
}

function AddSP(data) {
  //check your business rules is current user can perform action
  return new Promise((resolve) => {
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

    account.getByEmail(data.Profile.email).then(function (getbyemres) {
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

        account.createAccount(newaccount).then(function (createres) {
          if (createres.success) {
            data.Profile.accountid = createres.UserId.toString();
            data.Profile.name = data.Profile.first_name + ' ' + data.Profile.last_name;

              sp_dal.AddSP(data).then(function (saveres) {
                  if (saveres.success) {
                    response.success = true;
                    response.spid = saveres.spid;
                  }
                  else {
                    response.success = false;
                    response.error='Account created but could not add SP';
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
  //check your business rules is current user can perform action
  return sp_dal.GetAll();
}

function DeleteSP(data) {
  //check your business rules is current user can perform action
  return sp_dal.DeleteSP(data);
}

