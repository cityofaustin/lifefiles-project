/*
The master app module for containment of all modules and registering app features. 
Also handles ajax server calls for fetching module html on demand.
This allows for nice object referencing e.g. mypass.[feature].[method]
*/
'use strict';
(function () {

  window.mypass = new mypass();

  function mypass() {
    var dataCache;
    var featureCache = {
      features: [],
      childfeatures: []
    }; //helps with dynamic module loading

    var myapp = {
      baseURL: 'http://localhost',
      port: ':9005',
    };

    var __mypass = this;
    this.registerFeature = registerFeature;
    this.registerFeatureChild = registerFeatureChild;

    function init() {
      /*
      mypass.booted Event is thrown by appboot.js to notify when all code is loaded
      this helps set things off properly.
      */
      window.addEventListener('mypass.booted', onAppBoot); 
      window.addEventListener('mypass.startwaiting', onStartWaiting);
      window.addEventListener('mypass.stopwaiting', onStopWaiting);
      
    }

    function onAppBoot(evt) {
      //now start loading all features into main application so the features are accessible to app

      window.addEventListener(__mypass.Events.APP_NAV.loggedout, onLogout);

      for (var index = 0; index < featureCache.features.length; index++) {
        const feat = featureCache.features[index];
        __mypass.navigation.addFeature(feat);
        __mypass[feat.name] = feat.methods;
      }
      featureCache.features = [];

      for (var index = 0; index < featureCache.childfeatures.length; index++) {
        const feat = featureCache.childfeatures[index];
        __mypass[feat.parent][feat.name] = feat.methods;
        __mypass.navigation.getChildhtml(feat.url).then(function (res) {
          __mypass[feat.parent][feat.name].template = res;
        });
      }

      featureCache.childfeatures = [];

      if (!__mypass.session.isAuthenticated()) {
        __mypass.goto.login();
      }
      else {
        var account = __mypass.session.getSession();
        //per the user's role we send them to the appropriate page
        switch (account.account_role) {
          case 1:
            __mypass.goto.admindashboard();
            break;
          case 2:
            __mypass.goto.ownerdashboard();
            break;
          case 3:
            __mypass.goto.sp_dashboard();
            break;
          case 4:
            __mypass.goto.agentdashboard();
            break;
          default:
            __mypass.goto.dashboard();
            break;
        }
      }

    }

    function onStartWaiting(params) {
      $('.start-waiting').show();
    }
    function onStopWaiting(params) {
      $('.start-waiting').hide();
    }

    function onLogout(evt) {
      __mypass.goto.login();
    }

    function registerFeature(feat) {
      featureCache.features.push(feat);

    }

    function registerFeatureChild(feat) {
      featureCache.childfeatures.push(feat);

    }

    __mypass.postMsg = postMsg;
    function postMsg(route, data) {

      return new Promise((resolve) => {

        var data_url = myapp.baseURL + myapp.port + route;
        var contentType = "application/json;charset=UTF-8";
        var Request = {
          'data': data
        };
        var xhr = new XMLHttpRequest();
        xhr.open('POST', data_url, true);
        xhr.setRequestHeader("Content-Type", contentType);
        xhr.onload = function (e) {
          if (this.status === 200) {
            resolve(JSON.parse(this.response));
          }
          else {
            var res = new Response();
            res.success = false;
            resolve(res);
          }
        };

        xhr.onerror = function (e) {
          var res = new Response();
          res.success = false;
          res.message = xhr.statusText;
          res.data = this.response ? JSON.parse(this.response) : '';
          resolve(res);
        };

        xhr.send(JSON.stringify(Request));

      });
    }

    function Response(response) {
      this.success;
      this.error;
      this.message = '';
      this.data = '';

      if (response) {
        this.success = response.success;
        this.error = response.error;
      }
    }

    function sortAlpha(a, b) {
      if (a.name.toLowerCase() > b.name.toLowerCase()) {
        return 1;
      }
      if (a.name.toLowerCase() < b.name.toLowerCase()) {
        return -1;
      }
      return 0;
    }

    init();

  }

})();


