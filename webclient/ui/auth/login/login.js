(function (mypass) {
  'use strict';


  mypass.registerFeature({
    name: 'login',
    url: '/ui/auth/login/login.html',
    load: loginLoad,
    methods: {
      login: login
    }
  });

  function init() {
  }

  function loginLoad(vt) {
    //ADD ANY PAGE CODE
    $('.btn-logout').addClass('hidden');

  }

  function login() {
    var req = {
      email: loginForm.elements.email.value,
      password: loginForm.elements.password.value
    };
    mypass.datacontext.auth.login(req).then(onlogin);
  }

  function onlogin(res) {
    if (res.success) {
      mypass.session.startSession(res.data);
      switch (res.data.account_role) {
        case 1:
            mypass.goto.admindashboard();
          break;
        case 2:
            mypass.goto.ownerdashboard();
          break;
        case 3:
            mypass.goto.sp_dashboard();
          break;
        case 4:
            mypass.goto.agentdashboard();
          break;
        default:
          // mypass.goto.dashboard();
          break;

      }

    }
    else {
      var dd = 'SHOW LOGIN ERROR';
    }

  }


  init();

})(mypass);