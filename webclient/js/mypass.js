'use strict';
(function () {

  window.mypass = new mypass();

  function mypass() {
    var dataCache;
    
    var myapp = {
      baseURL: 'http://localhost',
      port: ':9005/',
    };

    var __mypass = this;
    this.registerFeature = registerFeature;

    function init() {
      window.addEventListener('mypass.booted', onAppBoot);
    }

    function onAppBoot(evt) {
      window.addEventListener(__mypass.Events.APP_NAV.loggedout, onLogout);

      if (!__mypass.session.isAuthenticated()) {
        __mypass.goto.login();
      }
      else {
        __mypass.goto.dashboard();
      }

    }

    function onLogout(evt) {
      __mypass.goto.login();
    }

    function registerFeature(feat) {
      __mypass.navigation.addFeature(feat);
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


