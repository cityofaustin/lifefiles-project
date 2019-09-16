
var
util = require("util")
, _ = require('lodash')
, mypassDBConnection = require('../connection')
, common = require("../../common")
, database = require('./database')
;

exports.GetByOwnerId = GetByOwnerId;
exports.Create = Create;
exports.GetMembers = GetMembers;
exports.GetMembersForDB = GetMembersForDB;
exports.GetMemberRoles = GetMemberRoles;
exports.GetRoles = GetRoles;
exports.AddMember = AddMember;
exports.RemoveMember = RemoveMember;
exports.DropUserFromRole = DropUserFromRole;
exports.AddUserToRole = AddUserToRole;
exports.UpdateUserRole = UpdateUserRole;
exports.ChangePassword = ChangePassword;
exports.GetMemberDBRole = GetMemberDBRole;
exports.SaveAPIKey = SaveAPIKey;
exports.GetAPIKeys = GetAPIKeys;
exports.DropAPIkey=DropAPIkey;
exports.ResetPassword = ResetPassword;
exports.SaveProfile=SaveProfile;

var errors = {
NO_ACCESS: 'Access denied',
MISSING_PROFILE_DATA:'Missing required fields'
};

function Create(req, cb) {

// CREATE AN ACCOUNT
// ADD TO ACCOUNT MEMBER TABLE


//log('create called for '+util.inspect(req));
var connection = mypassDBConnection.GetConnection();
//var options = {sql: "CALL account_Create("+req.MembershipId+",'"+req.AccountName+"')"};
var sqlcmd = "CALL account_Create(?,?)";
var params = [req.MembershipId, req.AccountName];

//log('create called for options'+util.inspect(options));
connection.connect();
connection.query(sqlcmd, params, function (err, rows, fields) {
  var response = new common.response();
  if (err) {
    logger.log('err' + err);
    response.error = err;
    response.success = false;
    cb(response);
  }
  //log('rows='+util.inspect(rows));
  var obj = rows[0][0];
  response.success = true;
  response.Account = new Account(obj);
  response.HasAccount = !!response.Account.AccountId;
  //log('response.Account='+util.inspect(response));
  cb(response);
});
connection.end();
}



function AddMember(req, ownerMembershipId, cb) {

// log('AddMember called for ' + util.inspect(req));
var response = new common.response();
var connection = mypassDBConnection.GetConnection();
//var options = {sql: "CALL account_AddMember(" + req.MembershipId+','+req.AccountId+ ")"};
var sqlcmd = "CALL account_AddMember(?,?,?)";
var params = [req.MembershipId, req.AccountId, ownerMembershipId];

connection.connect();
connection.query(sqlcmd, params, function (err, rows, fields) {
  if (err) {
    logger.log('err' + err);
    response.error = err;
    response.success = false;
  }
  else {
    // log('AddMember sql reutnred  ' + util.inspect(rows[0]));
    req.AccountMemberId = rows[0][0].accountmemberid;
    response.NewMember = req;
    response.success = true;
  }
  cb(response);
  return;
});
connection.end();
}

function RemoveMember(req, removeMemberCallback) {
//log('RemoveMember called for ' + util.inspect(req));
var response = new common.response();
var connection = mypassDBConnection.GetConnection();
//var options = {sql: "CALL account_RemoveMember("+req.AccountMemberId+","+req.AccountId+","+req.OwnerMembershipId+")"};
var sqlcmd = "CALL account_RemoveMember(?,?,?)";
var params = [req.AccountMemberId, req.AccountId, req.OwnerMembershipId];

connection.connect();
connection.query(sqlcmd, params, function (err, rows, fields) {
  if (err) {
    logger.log('err ' + err);
    response.error = err;
    response.success = false;
  }
  else {
    // log('RemoveMember returned ' + util.inspect(rows));
    response.success = true;
  }
  removeMemberCallback(response);
  return;
});
connection.end();
}

function GetMembers(ownerMembershipId, cb) {

//log('GetUsers called for id' + ownerMembershipId);
var response = new common.response();
var connection = mypassDBConnection.GetConnection();
// var options = {sql: "CALL account_GetUsersByAccountOwnerId(" + ownerMembershipId + ")"};
var sqlcmd = "CALL account_GetUsersByAccountOwnerId(?)";
var params = [ownerMembershipId];

connection.connect();
connection.query(sqlcmd, params, function (err, rows, fields) {
  if (err) {
    logger.log('err' + err);
    response.error = err;
    response.success = false;
  }
  else {
    response.AccountUsers = [];
    //log('returned ' + utils.inspect(rows[0]));
    rows[0].forEach(function (r) {
      response.AccountUsers.push(new AccountMember(r));
    });
    response.success = true;
  }
  cb(response);
  return;
});
connection.end();
}

function GetMembersForDB(dbid, cb) {

//log('GetUsers called for id' + ownerMembershipId);
var response = new common.response();
var connection = mypassDBConnection.GetConnection();
// var options = {sql: "CALL account_GetUsersByAccountOwnerId(" + ownerMembershipId + ")"};
var sqlcmd = "CALL account_GetMembersForDB(?)";
var params = [dbid];

connection.connect();
connection.query(sqlcmd, params, function (err, rows, fields) {
  if (err) {
    logger.log('err' + err);
    response.error = err;
    response.success = false;
  }
  else {
    response.AccountUsers = [];
    //log('returned ' + utils.inspect(rows[0]));
    rows[0].forEach(function (r) {
      response.AccountUsers.push(new AccountMember(r));
    });
    response.success = true;
  }
  cb(response);
  return;
});
connection.end();
}


function GetMemberRoles(req, cb) {
//log('GetMemberRoles called for ' + util.inspect(req));
var response = new common.response();
var connection = mypassDBConnection.GetConnection();
var sqlcmd = "CALL account_GetUserPrivileges(?,?,?)";
var params = [req.OwnerMembershipId, req.AccountMemberId, req.AccountId];

connection.connect();
connection.query(sqlcmd, params, function (err, rows, fields) {
  if (err) {
    logger.log('err' + err);
    response.error = err;
    response.success = false;
  }
  else {
    response.AccountRoles = [];
    rows[0].forEach(function (p) {
      response.AccountRoles.push(new AccountRole(p));
    });
    response.success = true;
  }
  cb(response);
  return;
});
connection.end();
}

function GetMemberDBRole(req, cb) {
//log('GetMemberDBRole called for ' + util.inspect(req));
var response = new common.response();
var dbreq = {
  MembershipId: req.MembershipId,
  DbId: req.AccountRole.DbId
};
database.GetDbByIdForLogin(dbreq, function (getdbRes) {
  if (getdbRes.success) {
    var connection = mypassDBConnection.GetConnection(getdbRes.data);
    var cmd = 'CALL gen_meta_dbusermember_get_dbrole(?)';
    var params = [req.MembershipId];

    connection.connect();
    connection.query(cmd, params, function (err, rows, fields) {
      var response = new common.response();
      if (err) {
        logger.log('GetMemberDBRole err ' + err);
        response.DbId = req.AccountRole.DbId;
        response.error = err;
        response.success = false;
        cb(response);
        return;

      }
      response.success = true;
      response.AccountRole = req.AccountRole;
      response.AccountRole.DbRole = rows[0][0];

      if (response.AccountRole.DbRole && response.AccountRole.DbRole.permissions) {
        response.AccountRole.DbRole.permissions = JSON.parse(response.AccountRole.DbRole.permissions);
      }

      cb(response);
      return;
    });
    connection.end();
  }
  else {
    response.error = errors.NO_ACCESS;
    response.success = false;
    cb(response);
    return;
  }
});
}


function GetRoles(OwnerMembershipId, cb) {
//log('GetRoles called for ' + util.inspect(req));
var response = new common.response();
var connection = mypassDBConnection.GetConnection();
var options = { sql: "CALL account_GetRoles()" };
connection.connect();
connection.query(options, function (err, rows, fields) {
  if (err) {
    logger.log('err' + err);
    response.error = err;
    response.success = false;
  }
  else {
    response.Roles = rows[0];
    response.success = true;
  }
  cb(response);
  return;
});
connection.end();
}

function GetByOwnerId(id, cb) {
//log('GetByOwnerId called for id '+id);
var connection = mypassDBConnection.GetConnection();
//var options = {sql: "CALL account_GetByOwnerId("+id+")"};
var sqlcmd = "CALL account_GetByOwnerId(?)";
var params = [id];

connection.connect();
connection.query(sqlcmd, params, function (err, rows, fields) {
  var response = new common.response();
  if (err) {
    logger.log('GetByOwnerId err ' + err);
    response.error = err;
    response.success = false;
    cb(response);
    return;
  }
  //log('getbyownerid rows = '+util.inspect(rows));
  if (rows[0].length > 0) {
    response.Account = new Account(rows[0][0]);
    response.HasAccount = true;
  }
  else {
    response.Account = null;
    response.HasAccount = false;
  }
  response.success = true;
  cb(response);
  return;
});
connection.end();
}

function DropUserFromRole(req, cb) {
//log('DropUserFromRole called for ' + util.inspect(req));

var response = new common.response();
var connection = mypassDBConnection.GetConnection();
// var options = {sql: "CALL account_PrivilegeDrop(" + req.DbMemberId+")"};
var sqlcmd = "CALL account_PrivilegeDrop(?)";
var params = [req.DbMemberId];

connection.connect();
connection.query(sqlcmd, params, function (err, rows, fields) {
  if (err) {
    logger.log('err' + err);
    response.error = err;
    response.success = false;
  }
  else {
    //rows[0]
    response.success = true;
    response.DbMemberId = req.DbMemberId;
    response.message = 'role dropped';
    response.IsDropped = true;
  }
  cb(response);
  return;
});
connection.end();

}

function AddUserToRole(req, cb) {
//log('AddUserToRole called for ' + util.inspect(req));
var response = new common.response();
var connection = mypassDBConnection.GetConnection();
var sqlcmd = "CALL account_PrivilegeAdd(?,?,?,?,?)";
var params = [req.priv.DbId, req.priv.AccountMemberId, req.priv.RoleId, JSON.stringify(req.priv.Privileges), req.addby];

connection.connect();
connection.query(sqlcmd, params, function (err, rows, fields) {
  if (err) {
    logger.log('AddUserToRole err' + err);
    response.error = err;
    response.success = false;
    cb(response);
    return;
  }
  else {
    // log('AddPrivilege res' + util.inspect(rows[0]));
    response.DbMemberId = rows[0][0].dbmemberid;
    response.NewId = req.priv.NewId;

    var membershipid = rows[0][0].membershipid;
    var dbreq = {
      MembershipId: membershipid,
      DbId: req.priv.DbId
    };
    database.GetDbByIdForLogin(dbreq, function (getdbRes) {
      if (getdbRes.success) {
        var AccessInfo = {};
        AccessInfo.DbInfo = getdbRes.data;
        database.AddUserToDB(AccessInfo, membershipid, function (addUserRes) {
          if (!req.priv.DbRoleId) {
            response.success = true;
            cb(response);
            return;

          }
          //if user is assigned to a DbRoleId then add it
          AccessInfo.MembershipId = membershipid;
          AccessInfo.DbRoleId = req.priv.DbRoleId;
          MemberUpdateDBRole(AccessInfo, function (updateDBRoleRes) {
            response.success = true;
            cb(response);
            return;
          });
        });
      }
      else {
        response.error = errors.NO_ACCESS;
        response.success = false;
        cb(response);
        return;
      }
    });

  }

});
connection.end();

}



function UpdateUserRole(req, cb) {
//log('UpdateUserRole called for ' + util.inspect(req));
var response = new common.response();
var connection = mypassDBConnection.GetConnection();
var sqlcmd = "CALL account_PrivilegeUpdate(?,?,?,?,?)";
var params = [req.priv.DbMemberId, req.priv.DbId, req.priv.RoleId, JSON.stringify(req.priv.Privileges), req.chgbyMembershipId];

connection.connect();
connection.query(sqlcmd, params, function (err, rows, fields) {
  if (err) {
    logger.log('err' + err);
    response.error = err;
    response.success = false;
  }
  else {
    var dbreq = {
      MembershipId: req.chgbyMembershipId,
      DbId: req.priv.DbId
    };
    database.GetDbByIdForLogin(dbreq, function (getdbRes) {
      if (getdbRes.success) {
        var AccessInfo = {};
        AccessInfo.DbInfo = getdbRes.data;
        AccessInfo.MembershipId = req.priv.MembershipId;
        AccessInfo.DbRoleId = req.priv.DbRoleId;
        MemberUpdateDBRole(AccessInfo, function (updateDBRoleRes) {
          response.success = true;
          response.RoleUpdateDbMemberId = req.priv.DbMemberId;
          cb(response);
          return;
        });
      }
      else {
        response.error = errors.NO_ACCESS;
        response.success = false;
        cb(response);
        return;
      }
    });
  }

});
connection.end();

}

function MemberUpdateDBRole(req, cb) {
var connection = mypassDBConnection.GetConnection(req.DbInfo);
var cmd = 'CALL gen_meta_dbusermember_update_dbrole(?,?)';
var params = [req.MembershipId, req.DbRoleId];

connection.connect();
connection.query(cmd, params, function (err, rows, fields) {
  var response = new common.response();
  if (err) {
    logger.log('MemberUpdateDBRole err ' + err);
    response.error = err;
    response.success = false;
    cb(response);
    return;

  }
  response.success = true;
  cb(response);
  return;
});
connection.end();

}

function RemoveDBRole() { }



function ChangePassword(req, chCB) {
//log('ChangePassword called for ' + util.inspect(req));
var response = new common.response();
var connection = mypassDBConnection.GetConnection();
var sqlcmd = "CALL account_ChangePassword(?,?)";
var params = [req.OwnerMembershipId, req.NewPassword];

connection.connect();
connection.query(sqlcmd, params, function (err, rows, fields) {
  if (err) {
    logger.log('err' + err);
    response.error = err;
    response.success = false;
  }
  else {
    //rows[0]

    response.success = true;
  }
  chCB(response);
  return;
});
connection.end();

}

function SaveAPIKey(req) {
return new Promise((resolve) => {

  // log('SaveAPIKey called for ' + util.inspect(req));
  var response = new common.response();
  var connection = mypassDBConnection.GetConnection();
  var sqlcmd = "CALL apikey_insert(?,?,?,?,?,?)";
  var params = [
    req.AccountId,
    req.apikeyInfo.DbId,
    req.apikeyInfo.RoleId,
    req.apikeyInfo.Name,
    req.apikeyInfo.APIKey,
    req.MembershipId
  ];

  connection.connect();
  connection.query(sqlcmd, params, function (err, rows, fields) {
    if (err) {
      logger.log('err' + err);
      response.error = err;
      response.success = false;
    }
    else {
      response.apikeyid = rows[0][0].apikeyid;
      response.success = true;
    }
    resolve(response);
  });
  connection.end();
});
}


function DropAPIkey(req) {
return new Promise((resolve) => {
  // log('SaveAPIKey called for ' + util.inspect(req));
  var response = new common.response();
  var connection = mypassDBConnection.GetConnection();
  var sqlcmd = "CALL apikey_drop(?,?)";
  var params = [
    req.AccountId,
    req.keyid
  ];

  connection.connect();
  connection.query(sqlcmd, params, function (err, rows, fields) {
    if (err) {
      logger.log('err' + err);
      response.error = err;
      response.success = false;
    }
    else {
      response.success = true;
    }
    resolve(response);
  });
  connection.end();
});
}


function GetAPIKeys(req) {
return new Promise((resolve) => {

  // log('GetAPIKeys called for ' + util.inspect(req));
  var response = new common.response();
  var connection = mypassDBConnection.GetConnection();
  var sqlcmd = "CALL apikey_getall_byaccountid(?)";
  var params = [req.AccountId];

  connection.connect();
  connection.query(sqlcmd, params, function (err, rows, fields) {
    if (err) {
      logger.log('err' + err);
      response.error = err;
      response.success = false;
    }
    else {

      response.APIKeys = [];
      rows[0].forEach(function (p) {
        response.APIKeys.push(new APIKey(p));
      });

      response.success = true;
    }
    resolve(response);
  });
  connection.end();
});
}

function ResetPassword(req) {

return new Promise((resolve) => {
  //log('ResetPassword called for ' + util.inspect(req));

  var response = new common.response();
  var connection = mypassDBConnection.GetConnection();
  var sqlcmd = "CALL membershipResetPassword(?,?)";
  var params = [req.MembershipId, req.ResetCode];

  connection.connect();
  connection.query(sqlcmd, params, function (err, rows, fields) {
    if (err) {
      logger.log('err' + err);
      response.error = err;
      response.success = false;
    }
    else {
      response.success = true;
    }
    resolve(response);
    return;
  });
  connection.end();
});
}

function SaveProfile(req) {
return new Promise((resolve) => {
  var response = new common.response();
  if(!req.Profile.firstname || !req.Profile.lastname || !req.Profile.email){
    response.error = errors.MISSING_PROFILE_DATA;
    response.success = false;
    resolve(response);
    return;
  }
  // log('SaveProfile called for ' + util.inspect(req));
  
  var connection = mypassDBConnection.GetConnection();
  var sqlcmd = "CALL membershipUpdateUserInfo(?,?,?,?,?)";
  var params = [req.OwnerMembershipId, req.Profile.firstname,req.Profile.lastname,req.Profile.email,req.Profile.phone];

  connection.connect();
  connection.query(sqlcmd, params, function (err, rows, fields) {
    if (err) {
      logger.log('err' + err);
      response.error = err;
      response.success = false;
    }
    else {
      response.success = true;
    }
    resolve(response);
    return;
  });
  connection.end();
});
}

exports.Account = Account;

function Account(acc) {
this.AccountId = acc.accountid;
this.AccountMemberId = acc.accountmemberid || 0;
this.AccountName = acc.accountname;
this.CreateDate = acc.createdate;
return this;
}

exports.AccountMember = AccountMember;

function AccountMember(am) {
this.CreateDate = am.accountMemberCreateDate;
this.AccountId = am.accountid;
this.AccountMemberId = am.accountmemberid;
this.Email = am.email;
this.FirstName = am.firstname;
this.LastName = am.lastname;
this.Phone = am.phone;
this.MembershipId = am.membershipid;
return this;
}

exports.AccountRole = AccountRole;

function AccountRole(ap) {

this.DbMemberId = ap.dbmemberid;
this.DbId = ap.dbid;
this.AccountMemberId = ap.accountmemberid;
this.RoleId = ap.roleid;
this.Privileges = ap.roleprivileges ? JSON.parse(ap.roleprivileges) : [];
this.CreateBy = ap.createby;
this.CreateDate = ap.createdate;
this.UpdateBy = ap.updateby;
this.UpdateDate = ap.updatedate;
this.AccountId = ap.accountid;
this.RoleName = ap.rolename;
}

exports.APIKey = APIKey;

function APIKey(key) {
this.APIKeyId = key.apikeyid;
this.Name = key.name;
this.AccountId = key.accountid;
this.DbId = key.dbid;
this.RoleId = key.roleid;
this.Suspended = key.suspended;
this.APIKey = key.apikey;
this.CreateBy = key.createby;
this.CreateDate = key.createdate;
this.UpdateBy = key.updateby;
this.UpdateDate = key.updatedate;
return this;
}

function log(msg) {
logger.log('dal.account ' + msg);
}