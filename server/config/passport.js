var _ = require('lodash'),
  passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  bcrypt = require('bcryptjs'),
  logger = require('../common/logger'),
  util = require("util"),
  cookie = require('cookie'),
  cryptojs = require("crypto-js"),
  appconfig = require('./appsettings'),
  bll = require("../bll"),
  common = require('../common')
  ;

function AuthResponse(response) {
  this.success;
  this.error;
  if (response) {
    this.success = response.success;
    this.error = response.error;
  }
}

passport.serializeUser(function (user, done) {
  done(null, { id: user.primarykey });
});

passport.use(new LocalStrategy({ usernameField: 'email', passwordField: 'password', session: false },
  function (email, password, done) {

    bll.account.getByEmail(email).then(OnGetByEmail);

    function OnGetByEmail(response) {
      if (!response.success || !response.users || (response.users && response.users.length == 0)) {
        common.logger.log('could not get user by email');
        return done(null, false, { message: 'Email ' + email + ' not found' });
      }
      else {
        var member = response.users[0];
        if (member.accountlocked == 1) {
          return done(null, false, { message: 'Account Locked', status: 'locked' });
        }
        if (member.isreset) {
          return done(null, false, { message: 'Password is reset', status: 'reset' });
        }

        var isMatch = bcrypt.compareSync(password, member.password);
        if (isMatch) {
          //need to update their passwordattempt and/or accountlocked
          // bll.account.ClearBadAttempt(user.AccountId);
          // delete response.Account.AccountLocked;
          // delete response.Account.PasswordAttempt;
          return done(null, member);
        }
        else {
          if (member.passwordattempt > 5) {
            bll.account.LockAccount(member.primarykey);
          }
          else {
            bll.account.UpdateBadAttempt(member.primarykey);
          }
          return done(null, false, { message: 'Invalid email or password.', status: 'badattempt' });
        }
      }
    }

  }));


  // exports.isAuthenticated checks that the user has logged into the site and is allowed to access a URL resource
exports.isAuthenticated = function (req, res, next) {

  if (!req.cookies || (req.cookies && !req.cookies[appconfig.cookies.authCookieName])) {
    var authRetUrl;
    if (req.body.data) {
      var authResponse = new AuthResponse();
      authResponse.success = false;
      authResponse.authRetUrl = '/';
      res.status(200).send(authResponse);
    }
    else {
      res.redirect('/');
    }
    return;
  }

  var val = decodeURIComponent(req.cookies[appconfig.cookies.authCookieName]);
  var bytes = cryptojs.AES.decrypt(val, appconfig.secrets.cryptoKey);
  var decryptedCookieVal = bytes.toString(cryptojs.enc.Utf8);

  bll.account.getAccountById(decryptedCookieVal).then(function (response) {
    //PASSPORT REQUIRES A user OJBECT AS LOWERCASE

    if (!response.success || !response.users || (response.users && response.users.length == 0)) {
      var authResponse = new AuthResponse();
      authResponse.success = false;
      authResponse.authRetUrl = '/';
      res.status(200).send(authResponse);
      // res.redirect(authRetUrl);
      return;
    }

    var member = response.users[0];
    if (member.accountlocked == 1) {
      var authResponse = new AuthResponse();
      authResponse.success = false;
      authResponse.message = 'Account Locked';
      res.status(200).send(authResponse);
      return;
    }

    if (member.isreset) {
      var authResponse = new AuthResponse();
      authResponse.success = false;
      authResponse.message = 'Password is reset';
      res.status(200).send(authResponse);
      return;
    }

    // store current user info in enc cookie
    var encuserSessionInfo = decodeURIComponent(req.cookies[appconfig.cookies.userSessionInfo]);
    var usibytes = cryptojs.AES.decrypt(encuserSessionInfo, appconfig.secrets.cryptoKey);
    var userSessionInfo = usibytes.toString(cryptojs.enc.Utf8);

    req.user = {
      email: member.email,
      accountid: member.primarykey,
      AccountInfo: userSessionInfo && userSessionInfo.length > 0 ? JSON.parse(userSessionInfo) : ''
    };

    req.User = req.user;
    //refresh cookie expire window
    var ciphertext = cryptojs.AES.encrypt(req.user.accountid.toString(), appconfig.secrets.cryptoKey);
    res.cookie(appconfig.cookies.authCookieName, encodeURIComponent(ciphertext), { expires: appconfig.cookies.getExpiryDate() });

    if (req.isAuthenticated()) return next();
    res.redirect(authRetUrl);
  });
};

// Authorization Required middleware.
exports.isAuthorized = function (req, res, next) {
  logger.log('passport.isAuthorized is called req.user.tokens=' + req.User.tokens);

  var provider = req.path.split('/').slice(-1)[0];

  if (_.find(req.User.tokens, { kind: provider })) {
    next();
  } else {
    res.redirect('/auth/' + provider);
  }
};
