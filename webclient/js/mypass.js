(function () {

  window.mypass = new mypass();

  function mypass() {
    'use strict';

    var dataCache;
    var pageFragments = {};

    var myapp = {
      baseURL: 'http://localhost',
      port: ':9005/',
    };

    var __mypass = this;
    this.regmodule = regmodule;
    // this.showLogin = showLogin;

    function init() {
      $(document).ready(function () {
        
        window.addEventListener(__mypass.Events.APP_NAV.nav, onNavigate);
        //show login page if not logged in
        if (!__mypass.isAuth) {
          // __mypass.showLogin();
          loadPage(pageFragments.login);
        }


        // getTables().then(function (res) {
        //   myapp.Tables = res.data.Tables.sort(sortAlpha);
        //   for (var index = 0; index < myapp.Tables.length; index++) {
        //     const element = myapp.Tables[index];
        //     var el = document.createElement('li');
        //     el.innerText = element.name;
        //     el.addEventListener('click', OnClick, { useCapture: true });
        //     $('.left ul').append(el);
        //   }
        // });
        // $('#createData').on('click', function(){showDynamicForm();});
        // $('.btn-save').on('click',SaveForm);
      });
    }

    function onNavigate(evt) {
      var keys=Object.keys(pageFragments);
      for (var index = 0; index < keys.length; index++) {
        var key = keys[index];
        if(pageFragments[key].navEvent==evt.detail.route){
          loadPage(pageFragments[key]);
        }
      }
    }

    function loadPage(frag) {
      // if (!pageFragments.login.template) {
        // getModule(pageFragments.login).then(function (res) {
          getModule(frag).then(function (res) {
          $('.wrapper').empty();
          $('.wrapper').append(res.template);
        });
      // }
    }

    function regmodule(name, fragurl, loadEventName,navEvt) {
      pageFragments[name] = { name: name, url: fragurl, loadEvent: loadEventName,navEvent:navEvt };
    }

    function getModule(mod) {
      return new Promise((resolve) => {
        if (!pageFragments[mod.name] || !pageFragments[mod.name].template) {
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

    
    __mypass.postMsg=postMsg;
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


