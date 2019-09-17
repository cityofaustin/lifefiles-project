'use strict';
(function () {

  window.mypass = new mypass();

  function mypass() {
    var dataCache;
    var pageFragments = {};
    var myapp = {
      baseURL: 'http://localhost',
      port: ':9005/',
    };

    var __mypass = this;
    this.regmodule = regmodule;

    function init() {
      window.addEventListener('mypass.booted', onAppBoot);
    }

    function onAppBoot(evt) {
      window.addEventListener(__mypass.Events.APP_NAV.nav, onNavigate);
      window.addEventListener(__mypass.Events.APP_NAV.loggedout, onLogout);

      if (!__mypass.session.isAuthenticated()) {
        loadPage(pageFragments.login);
      }
      else {
        loadPage(pageFragments.dashboard);
      }

    }

    function onLogout(evt) {
      loadPage(pageFragments.login);
    }

    function onNavigate(evt) {
      var keys = Object.keys(pageFragments);
      for (var index = 0; index < keys.length; index++) {
        var key = keys[index];
        if (pageFragments[key].navEvent == evt.detail.route) {
          loadPage(pageFragments[key]);
        }
      }
    }

    function loadPage(frag) {
      getModule(frag).then(function (res) {
        $('.wrapper').empty();
        $('.wrapper').append(res.template);
      });
    }

    function regmodule(name, fragurl, loadEventName, navEvt) {
      pageFragments[name] = { name: name, url: fragurl, loadEvent: loadEventName, navEvent: navEvt };
    }

    function getModule(mod) {
      return new Promise((resolve) => {
        if (pageFragments[mod.name] && pageFragments[mod.name].template) {
          resolve(pageFragments[mod.name]);
          var event = new CustomEvent(mod.loadEvent);
          window.dispatchEvent(event);
        }
        else if (!pageFragments[mod.name] || !pageFragments[mod.name].template) {
          $.ajax({
            url: mod.url,
            dataType: "html"
          }).then(function (res) {
            mod.template = res;
            var event = new CustomEvent(mod.loadEvent);
            window.dispatchEvent(event);
            resolve(mod);
          });
        }
      });
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


