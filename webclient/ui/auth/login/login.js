(function (mypass) {
  'use strict';


  mypass.registerFeature({
    name: 'login',
    url: '/ui/auth/login/login.html',
    load: loginLoad
  });

  function init() {
  }

  function loginLoad(vt) {
      //ADD ANY PAGE CODE
      $('.btn-logout').addClass('hidden');
      $('.login button.login').on('click', function () {
        login();
      });
    
  }

  function login() {
    var req = {
      email: loginForm.elements.email.value,
      password: loginForm.elements.password.value
    };
    mypass.datacontext.account.login(req).then(onlogin);
  }

  function onlogin(res) {
    if (res.success) {
      mypass.session.startSession(res.data);
      mypass.goto.dashboard();
    }
    else {
      var dd = 'SHOW LOGIN ERROR';
    }

  }


  init();

})(mypass);