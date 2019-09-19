(function (mypass) {
  'use strict';

  mypass.session = {
    startSession: startSession,
    getSession: getSession,
    logout: logout,
    isAuthenticated: isAuthenticated
  };

  function init() {

  }

  function startSession(info) {
    mypass.cache.set('account', info);
  }

  function getSession() {
    return mypass.cache.get('account');
  }

  function isAuthenticated() {
    var acct = mypass.cache.get('account');
    if (!hasSessionCookie()) {
      mypass.cache.set('account', {});
      return false;
    }
    return acct && acct.status == "authenticated";
  }

  function logout() {
 
    mypass.cache.remove('account');
    mypass.datacontext.auth.logout().then(function (res) {
      if (res.success && res.status == "auth.loggedout") {
        var event = new CustomEvent(mypass.Events.APP_NAV.loggedout);
        window.dispatchEvent(event);
      }
    });
  }

  function hasSessionCookie() {
    var cookies = document.cookie.split(';');
    var hascookie = false;
    for (var index = 0; index < cookies.length; index++) {
      const element = cookies[index];
      if (element.split('=')[0].trim() == 'mpa') {
        hascookie = true;
      }
    }
    return hascookie;
  }

  init();

})(mypass);