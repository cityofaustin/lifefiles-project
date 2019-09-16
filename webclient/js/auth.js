(function (mypass) {
  'use strict';

  mypass.isAuth=false;
  
  mypass.authenticated = authenticated;
  // mypass.regmodule('login','/auth/login/login.html');

  function init() {
    
  }

  function authenticated(session) {
    // console.log('login');
  }


  init();

})(mypass);