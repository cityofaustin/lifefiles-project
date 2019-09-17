
var
  logger = require('../../common/logger'),
  util = require("util"),
  bll = require("../../bll"),
  _ = require('lodash'),
  passport = require('passport'),
  bcrypt = require('bcryptjs'),
  cookie = require('cookie'),
  cryptojs = require("crypto-js"),
  appconfig = require('../../config/appsettings'),
  uuidV4 = require('uuid/v4'),
  session = require('express-session')
  ;

exports.init = function (app) {
  app.post('/auth/register', Register);
  app.post('/auth/login', Login);
  app.post('/auth/logout', logout);
  app.post('/auth/resetpassword', ResetPassword);
  app.post('/auth/resetpasswordcomplete', ResetPasswordComplete);
  app.post('/auth/logck', CheckIsLoggedIn);

};


function Register(req, res, next) {
  req.register = req.body.data;
  // req.register.userip = req.ip; //if we want to get users ip address...be sure database accounts for it if needed

  var errors = !req.register.email || !req.register.first || !req.register.last || !req.register.password;
  if (errors) {
    var authResponse = new AuthResponse();
    authResponse.success = false;
    authResponse.error = 'all data required';
    res.status(200).send(authResponse);
    return;
  }
  else {
    bll.membership.getByEmail(req.register.email).then(function (response) {
      if (!response.success) {
        var authResponse = new AuthResponse();
        authResponse.error = 'There was an error attempting to complete request.';
        authResponse.success = false;
        res.status(200).send(authResponse);
        return;
      }
      else if (response.users) {
        var authResponse = new AuthResponse();
        authResponse.error = 'account exists';
        authResponse.success = false;
        res.status(200).send(authResponse);
        return;
      }
      else {
        var salt = bcrypt.genSaltSync(5);
        var passwordHash = bcrypt.hashSync(req.register.password, salt);
        req.register.password = passwordHash;
        req.register.emailcode = uuidV4();
        var uu = {
          email: req.register.email,
          first_name: req.register.first,
          last_name: req.register.last,
          password: req.register.password
        };
        bll.membership.createMembership(uu).then(function (createres) {
          var authResponse = new AuthResponse();
          if (createres.success) {
            var ciphertext = cryptojs.AES.encrypt(createres.UserId.toString(), appconfig.secrets.cryptoKey);
            res.cookie(appconfig.cookies.authCookieName, encodeURIComponent(ciphertext), { expires: appconfig.cookies.getExpiryDate() });
            authResponse.data = {
              email: req.register.email,
              first_name: req.register.first,
              last_name: req.register.last,
              authenticate: true
            };
            authResponse.success = true;
          }
          else {
            authResponse.success = false;
          }
          res.status(200).send(authResponse);
          return;
        });
      }
    });
  }
}


function Login(req, res, next) {
  req.login = req.body.data;
  req.body.email = req.login.email;
  req.body.password = req.login.password;

  passport.authenticate('local', { session: false }, function (err, user, info) {
    if (err) {
      common.logger.log('err ' + err);
      return next(err);
    }
    if (!user) {
      var authResponse = new AuthResponse();
      authResponse.success = false;
      authResponse.status = info.status;
      res.status(200).send(authResponse);
      return;
    }

    req.logIn(user, function (err) {
      if (err) {
        return next(err);
      }
      var authResponse = new AuthResponse();

      //NEED TO UPDATE LAST LOGIN DATETIME
      // bll.membership.UpdateLastLogin(user.MembershipId);
      //GET ANY USER ROLES
      // bll.access.GetRolesForMembership({ primarykey: user.primarykey.toString() }, function (getUserRolesRes) {
      //   if (!getUserRolesRes.success) {
      //     authResponse.success = false;
      //     res.status(200).send(authResponse);
      //     return;
      //   }
      //   else {
      var ciphertext = cryptojs.AES.encrypt(user.primarykey.toString(), appconfig.secrets.cryptoKey);
      res.cookie(appconfig.cookies.authCookieName, encodeURIComponent(ciphertext), { expires: appconfig.cookies.getExpiryDate() });
      authResponse.success = true;
      authResponse.status = appconfig.status.auth.loggedIn;
      authResponse.firstname = user.first_name;
      authResponse.lastname = user.last_name;
      authResponse.email = user.email;
      // authResponse.roles = getUserRolesRes.Roles;
      // authResponse.phone = user.Phone;
      // authResponse.createdon = user.createdate;

      res.status(200).send(authResponse);
      return;
      // });
    });
    // });
  })(req, res, next);
}

function logout(req, res, next) {

  req.session.oauthRequestToken = null;
  req.session.accessToken = null;

  res.clearCookie(appconfig.cookies.authCookieName);
  req.logout();

  var authResponse = new AuthResponse();
  authResponse.success = true;
  authResponse.status = appconfig.status.auth.loggedOut;
  // res.status(200).send(authResponse);
  res.redirect('/');
}

function ResetPassword(req, res, next) {
  req.email = req.body.RequestData.data[0].email;

  if (!req.email) {
    var authResponse = new AuthResponse();
    authResponse.success = false;
    res.status(200).send(authResponse);
    return;
  }

  bll.account.ResetPassword(req).then(function (resetRes) {
    res.status(200).send(resetRes);
    return;
  });
}

function ResetPasswordComplete(req, res, next) {
  //logger.log('AccountConfirm params ='+util.inspect(req.body.RequestData.data));
  var req = req.body.RequestData.data[0];
  var authResponse = new AuthResponse();

  if (!req.Regcode || !req.Password || (req.Password != req.PasswordConfirm)) {
    // logger.log('did not pass ' + util.inspect(req));
    authResponse.success = false;
    res.status(200).send(authResponse);
    return;
  }

  var salt = bcrypt.genSaltSync(5);
  req.Password = bcrypt.hashSync(req.Password, salt);

  bll.membership.getMembershipBy_PasswordRestCode(req).then(function (getMemRes) {

    if (!getMemRes.success) {
      authResponse.error = 'Unable to complete password reset';
      authResponse.success = false;
      res.status(200).send(authResponse);
      return;
    }

    bll.membership.resetPasswordComplete(req).then(function (response) {
      if (!response.success) {
        authResponse.error = 'Unable to complete password reset';
        authResponse.success = false;
      }
      else {
        authResponse.success = true;
        //send password changed email
        var rr = {
          Email: getMemRes.Membership.Email
        };
        // myServices.email.Send_PasswordChanged_Email(rr, function () { });
      }
      res.status(200).send(authResponse);
      return;
    });

  });


}

function CheckIsLoggedIn(req, res, next) {
  var authResponse = new AuthResponse();
  if (!req.cookies || (req.cookies && !req.cookies[appconfig.cookies.authCookieName])) {
    authResponse.success = false;

  }
  else {
    authResponse.success = true;
  }

  res.status(200).send(authResponse);
  return;

}


function AuthResponse(response) {

  this.success = true;
  this.error;

  if (response) {
    this.success = response.success;
    this.error = response.error;
  }
}
