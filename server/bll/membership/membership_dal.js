var
  util = require("util")
  , _ = require('lodash')
  , mypassDBConnection = require('../connection')
  , common = require("../../common")
  , mysql = require('mysql')
  ;

exports.getMembershipByEmail = getMembershipByEmail;
exports.getMembershipById = getMembershipById;
exports.createMembership = createMembership;
exports.membershipEmailConfirm = membershipEmailConfirm;
exports.resetPasswordComplete=resetPasswordComplete;
exports.UpdateLastLogin=UpdateLastLogin;
exports.LockAccount=LockAccount;
exports.UpdateBadAttempt=UpdateBadAttempt;
exports.ClearBadAttempt=ClearBadAttempt;
exports.getMembershipBy_PasswordRestCode=getMembershipBy_PasswordRestCode;


function Membership(m) {
  m = m[0];
  this.MembershipId = m.membershipId;
  this.Email = m.email;
  this.Password = m.password;
  this.FirstName = m.firstname;
  this.LastName = m.lastname;
  this.Phone = m.phone;
  this.CreateDate = m.createdate;
  this.IsReset = m.isreset;
  this.LastLogin = m.lastlogin;
  this.PasswordChanged=m.passwordchanged;
  this.AccountLocked=m.accountlocked;
  this.IsTrial=m.trialplan;
  this.PasswordAttempt=m.passwordattempt;
  this.GoogleOAuth=m.googleoauth;
  return this;
}

function membershipEmailConfirm(req, cb) {

  //logger.log('membershipEmailConfirm');
  var response = new common.response();
  var connection = mypassDBConnection.GetConnection();
  var qry = 'CALL membershipEmailConfirm(?,?);';
  var params = [req.Regcode, req.Password];

  connection.connect();
  var query = connection.query(qry, params, function (err, rows, fields) {
    if (err) {
      logger.log('err' + err);
      response.error = err;
      response.success = false;
    }
    else {
      //logger.log('createMembership qry return '+ util.inspect(rows));
      var r = rows[0][0];
      response.MembershipId = r.membershipId;
      response.success = true;
    }
    cb(response);
    return;
  });
  connection.end();
}

function getMembershipById(id, cb) {
  var response = new common.response();
  if (!id || id < 1) {
    response.error = 'noid';
    response.success = false;
    cb(response);
    return;
  }

  var connection = mypassDBConnection.GetConnection();
  var q = 'CALL membershipGetById(?);';
  var params = [id];

  connection.connect();
  connection.query(q, params, function (err, rows, fields) {
    var response = new common.response();
    if (err) {
      logger.log('getMembershipById err' + err);
      response.error = err;
      response.success = false;
      cb(response);
      return;
    }
    response.success = true;
    response.Membership = new Membership(rows[0]);
    //logger.log('response.Membership : '+ util.inspect(response.Membership));
    cb(response);
    return;
  });
  connection.end();
}

function getMembershipByEmail(email, cb) {
  // return new Promise((resolve) => {
  //log('in getMembershipByEmail = ' + email);
  var connection = mypassDBConnection.GetConnection();
  //var options = { sql: "CALL membershipGetByEmail('" + email + "');" };
  var q = 'CALL membershipGetByEmail(?);';
  var params = [email];

  var response = new common.response();
  connection.connect();
  connection.query(q, params, function (err, rows, fields) {
    //logger.log('getUser come back');
    if (err) {
      //logger.log('getMembershipByEmail err ' + err);
      response.error = err;
      response.success = false;
      cb(response);
      return;
    }

    //log('dal.getMembershipByEmail  rows: '+ util.inspect(rows[0]));
    response.success = true;
    if (rows && rows[0].length > 0) {
      response.HasMembership = true;
      response.Membership = new Membership(rows[0]);
    }
    else {
      response.HasMembership = false;
    }
    cb(response);
    return;
  });
  connection.end();
}

function createMembership(userInfo, cb) {
  // logger.log('createMembership');
  var response = new common.response();
  if (!userInfo) {
    response.error = 'no member info';
    response.success = false;
    cb(response);
    return;
  }

  var connection = mypassDBConnection.GetConnection();
  //var options = { sql: "CALL membershipCreate('" + userInfo.Email + "','" + userInfo.Password + "','" + userInfo.FirstName + "','" + userInfo.LastName + "','" + (userInfo.Phone || '') + "','" + (userInfo.EmailCode || '') + "');" };
  var q = 'CALL membershipCreate(?,?,?,?,?,?);';
  var params = [
    userInfo.Email,
    userInfo.Password,
    userInfo.FirstName,
    userInfo.LastName,
    (userInfo.Phone || ''),
    (userInfo.EmailCode || '')
  ];

  // logger.log('createMembership qry ' + util.inspect(options));
  connection.connect();
  var query = connection.query(q, params, function (err, rows, fields) {
    if (err) {
      logger.log('err' + err);
      response.error = err;
      response.success = false;
    }
    else {
      var r = rows[0][0];
      //logger.log('createMembership qry return '+ util.inspect(r));
      response.MembershipId = r.membershipid;
      response.success = true;
    }
    cb(response);
    return;
  });
  connection.end();

}

function resetPasswordComplete(req) {
  return new Promise((resolve) => {
   //logger.log('membershipEmailConfirm');
   var response = new common.response();
   var connection = mypassDBConnection.GetConnection();
   var qry = 'CALL membershipResetPasswordComplete(?,?);';
   var params = [req.Regcode, req.Password];
 
   connection.connect();
   var query = connection.query(qry, params, function (err, rows, fields) {
     if (err) {
       logger.log('err' + err);
       response.error = err;
       response.success = false;
     }
     else {
      //  var r = rows[0][0];
      //  response.MembershipId = r.membershipId;
       response.success = true;
     }
     resolve(response);
     return;
   });
   connection.end();
  });
}

function getMembershipBy_PasswordRestCode(req) {
  return new Promise((resolve) => {
   //logger.log('membershipEmailConfirm');
   var response = new common.response();
   var connection = mypassDBConnection.GetConnection();
   var qry = 'CALL membershipBy_PasswordRestCode(?);';
   var params = [req.Regcode];
 
   connection.connect();
   var query = connection.query(qry, params, function (err, rows, fields) {
     if (err) {
       logger.log('err' + err);
       response.error = err;
       response.success = false;
     }
     else {
      
      if (rows && rows[0].length > 0) {
        response.success = true;
        response.HasMembership = true;
        response.Membership = new Membership(rows[0]);
      }
      else {
        response.success = false;
        response.HasMembership = false;
      }
     }
     resolve(response);
     return;
   });
   connection.end();
  });
}

function UpdateLastLogin(membershipId) {
  return new Promise((resolve) => {
  var response = new common.response();
   var connection = mypassDBConnection.GetConnection();
   var qry = 'CALL membershipUpdateLastLogin(?);';
   var params = [membershipId];
 
   connection.connect();
   var query = connection.query(qry, params, function (err, rows, fields) {
     if (err) {
       logger.log('err' + err);
       response.error = err;
       response.success = false;
     }
     else {
      //  var r = rows[0][0];
      //  response.MembershipId = r.membershipId;
       response.success = true;
     }
     resolve(response);
     return;
   });
   connection.end();
  });
}


function LockAccount(membershipId) {
  return new Promise((resolve) => {
  var response = new common.response();
   var connection = mypassDBConnection.GetConnection();
   var qry = 'CALL membershipLockAccount(?);';
   var params = [membershipId];
 
   connection.connect();
   var query = connection.query(qry, params, function (err, rows, fields) {
     if (err) {
       logger.log('err' + err);
       response.error = err;
       response.success = false;
     }
     else {
      //  var r = rows[0][0];
      //  response.MembershipId = r.membershipId;
       response.success = true;
     }
     resolve(response);
     return;
   });
   connection.end();
  });
}


function UpdateBadAttempt(membershipId) {
  return new Promise((resolve) => {
  var response = new common.response();
   var connection = mypassDBConnection.GetConnection();
   var qry = 'CALL membershipUpdateBadAttempt(?);';
   var params = [membershipId];
 
   connection.connect();
   var query = connection.query(qry, params, function (err, rows, fields) {
     if (err) {
       logger.log('err' + err);
       response.error = err;
       response.success = false;
     }
     else {
      //  var r = rows[0][0];
      //  response.MembershipId = r.membershipId;
       response.success = true;
     }
     resolve(response);
     return;
   });
   connection.end();
  });
}

function ClearBadAttempt(membershipId) {
  return new Promise((resolve) => {
  var response = new common.response();
   var connection = mypassDBConnection.GetConnection();
   var qry = 'CALL membershipClearBadAttempt(?);';
   var params = [membershipId];
 
   connection.connect();
   var query = connection.query(qry, params, function (err, rows, fields) {
     if (err) {
       logger.log('err' + err);
       response.error = err;
       response.success = false;
     }
     else {
      //  var r = rows[0][0];
      //  response.MembershipId = r.membershipId;
       response.success = true;
     }
     resolve(response);
     return;
   });
   connection.end();
  });
}



function log(msg) {
  logger.log('dal membership ' + msg);
}