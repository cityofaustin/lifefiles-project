
var
  config = require('../appconfig'),
  _ = require('lodash'),
  uuidV4 = require('uuid/v4'),
  fs = require('fs')
  ;


exports.secrets = {
  cryptoKey: 'wjw8ehj3be7fhrh7eheb'
};


exports.cookies = {
  authCookieName: 'xbdvwvs',
  getExpiryDate: function () {
    return new Date(Date.now() + 60 * 60 * 1000);
  },
};

exports.status = {
  auth: {
    loggedOut: 'auth.loggedout',
    loggedIn: 'authenticated',
    notLoggedIn: 'auth.notLoggedIn'
  }
};


exports.SETTINGS = {
  local: {
    host: 'localhost',
    user: 'dbuser',
    password: 'Aaa111!',
    database: 'mypass'
  },
  production: {
    host: 'rds.amazonaws.com',
    user: 'dbuser',
    password: 'aaaaa',
    database: 'mypass',
    ssl: 'Amazon RDS'
  },
  development: {
    host: '.rds.amazonaws.com',
    user: 'dbuser',
    password: 'aaaa',
    database: 'mypass',
    ssl: 'Amazon RDS'
  }
};
