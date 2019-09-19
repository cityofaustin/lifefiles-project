(function (mypass) {
  'use strict';

  mypass.datacontext = {};

  mypass.datacontext.auth =  {
    register:function(params) {return mypass.postMsg('/auth/register', params);},
    login:function(params) {return mypass.postMsg('/auth/login', params);},
    logout:function(params) {return mypass.postMsg('/auth/logout', params);},
  };

  mypass.datacontext.membership =  {
    save:function(params) {return mypass.postMsg('/membership/save', params);}
  };



})(mypass);