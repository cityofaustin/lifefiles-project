(function (mypass) {
  'use strict';

  mypass.login = login;
  mypass.regmodule('login', '/ui/auth/login/login.html', 'onLoginLoad', mypass.Events.APP_NAV.login);

  function init() {
    window.addEventListener('onLoginLoad', onLoginLoad);
  }

  function onLoginLoad(evt) {
    setTimeout(function () {
      $('.login button.login').on('click', function () {
        login();
      });
      $('.login button.create-acct').on('click', function () {
        var event = new CustomEvent(mypass.Events.APP_NAV.nav, { detail: { route: mypass.Events.APP_NAV.signup } });
        window.dispatchEvent(event);
      });

    }, 1000);
  }

  function login() {
    // console.log('login');
    var req = {
      email: loginForm.elements.email.value,
      password: loginForm.elements.password.value
    };
    mypass.datacontext.account.register(req).then(onregister);
  }


  init();

})(mypass);