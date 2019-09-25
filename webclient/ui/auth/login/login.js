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
    $( ".login input[name='password']" ).keyup(function(evt) {
      if(evt.keyCode==13){
        mypass.login.login();
      }
    });
  }

  function loginLoad(vt) {
    //ADD ANY PAGE CODE
    $('.btn-logout').addClass('hidden');
  

  }

  function validate() {
    if(signupform.elements.confpassword.value != signupform.elements.password.value){
      mypass.validation.showErrorLabel(label);
    }
    else{
      mypass.validation.hideErrorLabel(label);
    }
    
  }

  function login() {
    mypass.validation.hideErrorLabel(['lbl-email','lbl-pass']);

    var req = {
      email: loginForm.elements.email.value.trim(),
      password: loginForm.elements.password.value
    };

    var emailChk = req.email.match(/^[a-z0-9!#$%&'*+/=?^_`{|}~.-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i);
    if(!req.email || !emailChk){
      mypass.validation.showErrorLabel('lbl-email');
    }
    else if(!req.password){
      mypass.validation.showErrorLabel('lbl-pass');
    }
    else{
      mypass.datacontext.auth.login(req).then(onlogin);
    }
    
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
          mypass.goto.dashboard();
          break;

      }

    }
    else {
      var dd = 'SHOW LOGIN ERROR';
    }

  }


  setTimeout(init,1200);

})(mypass);