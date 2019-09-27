//this serves as a data layer for the app. Place all api routing here.
//keeping api routes in one place helps alot

(function (mypass) {
  'use strict';

  mypass.datacontext = {};

  mypass.datacontext.auth =  {
    register:function(params) {return mypass.postMsg('/auth/register', params);},
    login:function(params) {return mypass.postMsg('/auth/login', params);},
    logout:function(params) {return mypass.postMsg('/auth/logout', params);},
  };

  mypass.datacontext.account =  {
    save:function(params) {return mypass.postMsg('/account/save', params);},
    deleteAccount:function(params) {return mypass.postMsg('/account/delete', params);}
  };

  mypass.datacontext.administrator =  {
    save:function(params) {return mypass.postMsg('/administrator/save', params);},
  };

  mypass.datacontext.agent =  {
    getAll:function(params) {return mypass.postMsg('/agent/getall', params);},
    save:function(params) {return mypass.postMsg('/agent/save', params);},
    deleteAccount:function(params) {return mypass.postMsg('/agent/delete', params);}
  };

  mypass.datacontext.owner =  {
    save:function(params) {return mypass.postMsg('/owner/save', params);},
    deleteAccount:function(params) {return mypass.postMsg('/owner/delete', params);}
  };

  mypass.datacontext.serviceprovider =  {
    getAll:function(params) {return mypass.postMsg('/serviceprovider/getall', params);},
    save:function(params) {return mypass.postMsg('/serviceprovider/save', params);},
    delete:function(params) {return mypass.postMsg('/serviceprovider/delete', params);}
  };


})(mypass);