
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
  // myServices = require('../../services'),
  uuidV4 = require('uuid/v4'),
  session = require('express-session')
  ;

exports.init = function (app) {
  app.post('/auth/register', Register);
  app.post('/auth/login', Login);
  app.post('/auth/logout', logout);
  app.post('/auth/accountconfirm', AccountConfirm);
  app.post('/auth/resetpassword', ResetPassword);
  app.post('/auth/resetpasswordcomplete', ResetPasswordComplete);
  app.post('/auth/logck', CheckIsLoggedIn);

};

function AccountConfirm(req, res, next) {

  //logger.log('AccountConfirm params ='+util.inspect(req.body.RequestData.data));
  var req = req.body.RequestData.data[0];
  var authResponse = new AuthResponse();

  if (!req.Regcode || !req.Password || (req.Password != req.PasswordConfirm)) {
    logger.log('did not pass ' + util.inspect(req));
    authResponse.success = false;
    res.status(200).send(authResponse);
    return;
  }

  var salt = bcrypt.genSaltSync(5);
  req.Password = bcrypt.hashSync(req.Password, salt);

  bll.membership.membershipEmailConfirm(req, function (response) {
    if (!response.success) {
      authResponse.error = 'There was an error attempting to fulfil request.';
      authResponse.success = false;
    }
    else {
      authResponse.success = true;
    }
    res.status(200).send(authResponse);
    return;
  });

}

function Register(req, res, next) {
  req.register = req.body.data;
  req.register.userip = req.ip;

  var errors = !req.register.email || !req.register.first || !req.register.last || !req.register.password;
  if (errors) {
    var authResponse = new AuthResponse();
    authResponse.success=false;
    authResponse.error = 'all data required';
    res.status(200).send(authResponse);
    return;
  }
  else {
    // req.register.email
    bll.membership.getByEmail(req.register.email, function (response) {
      if (!response.success) {
        var authResponse = new AuthResponse();
        authResponse.error = 'There was an error attempting to complete request.';
        authResponse.success = false;
        res.status(200).send(authResponse);
        return;
      }
      else {
        //logger.log('response.Membership : '+ util.inspect(response.Membership));
        var authResponse = new AuthResponse(response);
        if (response.HasMembership) {
          authResponse.success = false;
          res.status(200).send(authResponse);
          return;
        }
        else {
          if (!req.register.IsReg) {
            req.register.Password = uuidV4();
            req.register.TempPassword = req.register.Password;
          }

          var salt = bcrypt.genSaltSync(5);
          var passwordHash = bcrypt.hashSync(req.register.Password, salt);
          req.register.Password = passwordHash;
          req.register.EmailCode = uuidV4();

          bll.membership.createMembership(req.register, function (createRes) {
            //logger.log('Calling bll.membership.createMembership'+util.inspect(createRes));
            if (!createRes.success) {
              authResponse = new AuthResponse();
              authResponse.success = false;
              res.status(200).send(authResponse);
              return;
            }
            else {
              var acct = {};
              acct.MembershipId = createRes.MembershipId;
              acct.AccountName = 'My Account';

              bll.account.Create(acct, function (crtRes) {
                //log('create crtRes = '+util.inspect(crtRes));
                if (crtRes.success && crtRes.HasAccount) {
                  myServices.email.SendRegisterEmail(req.register, function () { });

                  authResponse = new AuthResponse(createRes);
                  authResponse.success = true;
                  if (!req.register.IsReg) {
                    authResponse.temppass = req.register.TempPassword;
                  }

                }
                else {
                  authResponse = new AuthResponse();
                  authResponse.success = false;
                  //authResponse.error=errors.NO_CREATE;
                }
                res.status(200).send(authResponse);
                return;
              });
            }

          });
        }
      }
    });

  }

  // });



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

function Login(req, res, next) {
  req.login = req.body.RequestData.data[0].login;
  req.body.email = req.login.email;
  req.body.password = req.login.password;
  //logger.log('auth controller req.Login='+util.inspect(req.login));
  //req.assert('email', 'Email is not valid').isEmail();
  //req.assert('password', 'Password cannot be blank').notEmpty();
  var errors = req.validationErrors();

  passport.authenticate('local', { session: false }, function (err, user, info) {
    //logger.log('passport.authenticate returned user = '+util.inspect(user));
    //logger.log('passport.authenticate returned err = '+util.inspect(err));
    //logger.log('passport.authenticate returned info = '+util.inspect(info));

    if (err) {
      logger.log('err ' + err);
      return next(err);
    }
    if (!user) {
      // logger.log('sending back to login');
      var authResponse = new AuthResponse();
      authResponse.success = false;
      authResponse.status = info.status;
      res.status(200).send(authResponse);
      return;
      // return res.redirect('/login');
    }

    req.logIn(user, function (err) {
      if (err) {
        return next(err);
        // res.status(200).send(authResponse);
      }
      // logger.log('passport.authenticate '+util.inspect(user));
      //logger.log('appconfig.cookies.authCookieName='+appconfig.cookies.authCookieName);
      //logger.log('CryptoJS= '+util.inspect(cryptojs));

      bll.membership.UpdateLastLogin(user.MembershipId);

      var authResponse = new AuthResponse();
      bll.access.GetRolesForMembership({ MembershipId: user.MembershipId.toString() }, function (getUserRolesRes) {
        if (!getUserRolesRes.success) {
          authResponse.success = false;
          res.status(200).send(authResponse);
          return;
        }
        else {
          var ciphertext = cryptojs.AES.encrypt(user.MembershipId.toString(), appconfig.secrets.cryptoKey);
          res.cookie(appconfig.cookies.authCookieName, encodeURIComponent(ciphertext), { expires: appconfig.cookies.getExpiryDate() });
          //http://expressjs.com/en/api.html#res.cookie
          // clearCookie('cookie_name');
          authResponse.success = true;
          authResponse.status = appconfig.status.auth.loggedIn;
          authResponse.roles = getUserRolesRes.Roles;
          authResponse.firstname = user.FirstName;
          authResponse.lastname = user.LastName;
          authResponse.email = user.Email;
          authResponse.phone = user.Phone;
          authResponse.istrial = user.IsTrial;
          authResponse.createdon = user.CreateDate;


          bll.account.GetByOwnerId(user.MembershipId.toString(), function (acctRes) {
            if (acctRes.success && acctRes.HasAccount) {
              authResponse.AccountId = acctRes.Account.AccountId;
              authResponse.AccountMemberId = acctRes.Account.AccountMemberId;
            }
            res.status(200).send(authResponse);
            return;
          });
        }
      });

    });

  })(req, res, next);
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

  this.success=true;
  this.error;

  if (response) {
    this.success = response.success;
    this.error = response.error;
  }
}
