(function (mypass) {
  'use strict';

  mypass.isAuth = false;
  mypass.session = {
    startSession: startSession,
    getSession: getSession,
    logout: logout
  };

  function init() {
  }

  function startSession(info) {
    if (mypass.cache) {
      mypass.cache.set('account', info);
    }
  }

  function getSession() {
    if (mypass.cache) {
      return mypass.cache.get('account');
    }
  }

  function logout() {
    if (mypass.cache) {
      mypass.cache.remove('account');
    }
  }

  init();

})(mypass);