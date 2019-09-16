(function (mypass) {
  'use strict';

  mypass.datacontext = {};

  mypass.datacontext.account =  {
    register:function(params) {return mypass.postMsg('auth/register', params);}
  };

  

})(mypass);