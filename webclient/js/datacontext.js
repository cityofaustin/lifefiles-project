(function (mypass) {
  'use strict';

  mypass.datacontext = {};

  mypass.datacontext.account =  {
    register:function(params) {return mypass.postMsg('auth/register', params);},
    login:function(params) {return mypass.postMsg('auth/login', params);}
  };

  

})(mypass);