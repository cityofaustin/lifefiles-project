(function (mypass) {
  'use strict';

  mypass.datacontext = {};

  mypass.datacontext.account=new account();
  function account() {
    this.register=register;
    function register(params) {
      return mypass.postMsg('auth/register',params);
    }
    
  }

  
})(mypass);