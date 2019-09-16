var _ = require('lodash'),
  passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  bcrypt = require('bcryptjs'),
  logger = require('../common/logger'),
  util = require("util"),
  cookie = require('cookie'),
  cryptojs = require("crypto-js"),
  appconfig = require('./appsettings'),
  bll = require("../bll")
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
  //logger.log('passport.serializeUser '+util.inspect(user));
  done(null, { id: user.MembershipId });
});

passport.use(new LocalStrategy({ usernameField: 'email', passwordField: 'password', session: false }, function (email, password, done) {

  //logger.log('passport call getMembershipByEmail');
  bll.membership.getMembershipByEmail(email, function (response) {

    //logger.log('response=' + util.inspect(response));
    var user = {};
    if (!response.success) {
      logger.log('no good');
      return done(null, false, { message: 'Email ' + email + ' not found' });

    }
    else {
      //logger.log('testing password ');
      //logger.log('response=' + util.inspect(response));

      if (!response.HasMembership) {
        return done(null, false, { message: 'Invalid email or password.', status: 'badattempt' });
      }
      if (response.Membership) {

        if (response.Membership.AccountLocked == 1) {
          return done(null, false, { message: 'Account Locked', status: 'locked' });
        }

        if (response.Membership.IsReset) {
          return done(null, false, { message: 'Password is reset', status: 'reset' });
        }
        var isMatch = bcrypt.compareSync(password, response.Membership.Password);
        if (isMatch) {
          // this.AccountLocked=m.accountlocked;
          // this.IsTrial=m.trialplan;
          // this.PasswordAttempt=m.passwordattempt;
          //need to update their passwordattempt and/or accountlocked
          bll.membership.ClearBadAttempt(user.MembershipId);
          delete response.Membership.AccountLocked;
          delete response.Membership.PasswordAttempt;

          return done(null, response.Membership);
        }
        else {
          if (response.Membership.PasswordAttempt > 5) {
            bll.membership.LockAccount(response.Membership.MembershipId);
          }
          else {
            bll.membership.UpdateBadAttempt(response.Membership.MembershipId);
          }
          return done(null, false, { message: 'Invalid email or password.', status: 'badattempt' });
        }
      }
    }
  });

}));

exports.isAuthenticated = function (req, res, next) {

  //logger.log('passport.isAuthenticated cookies = '+util.inspect(req.cookies));
  // logger.log('passport = '+util.inspect(req));
  // logger.log('passport = ' + req.url);

  if (!req.cookies || (req.cookies && !req.cookies[appconfig.cookies.authCookieName])) {

    var authRetUrl;
    if (req.body.RequestData) {
      authRetUrl = req.body.RequestData.location.length > 3 ? '/login?url=' + req.body.RequestData.location : '/login';
      var authResponse = new AuthResponse();
      authResponse.success = false;
      authResponse.authRetUrl = authRetUrl;
      res.status(200).send(authResponse);
    }
    else {
      authRetUrl = req.url.length > 3 ? '/login?url=' + req.url : '/login';
      res.redirect(authRetUrl);
    }

    return;
  }

  var val = decodeURIComponent(req.cookies[appconfig.cookies.authCookieName]);
  var bytes = cryptojs.AES.decrypt(val, appconfig.secrets.cryptoKey);
  var decryptedCookieVal = bytes.toString(cryptojs.enc.Utf8);

  //find by decrypted user id
  bll.membership.getMembershipById(decryptedCookieVal, function (response) {
    //logger.log('exports.isAuthenticated = '+util.inspect(response));
    //**********************IMPORTANT**********************
    //PASSPORT REQUIRES A user OJBECT AS LOWERCASE
    if (!response.success || !response.Membership) {
      res.redirect(authRetUrl);
      return;
    }
    req.user = {
      Email: response.Membership.Email,
      FirstName: response.Membership.FirstName,
      LastName: response.Membership.LastName,
      MembershipId: response.Membership.MembershipId
    };
    
    if(response.Membership.GoogleOAuth){
      req.user.GoogleOAuth = response.Membership.GoogleOAuth;
    }
    // req.user.MembershipId = response.Membership.MembershipId;
    req.User = req.user;

    //refresh cookie expire window
    var ciphertext = cryptojs.AES.encrypt(response.Membership.MembershipId.toString(), appconfig.secrets.cryptoKey);
    res.cookie(appconfig.cookies.authCookieName, encodeURIComponent(ciphertext), { expires: appconfig.cookies.getExpiryDate() });

    //add empty google api cookie
    // if(!req.cookies.hasOwnProperty(appconfig.cookies.google_api_name)){
    //   res.cookie(appconfig.cookies.google_api_name, '');
    // }
    
    

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
