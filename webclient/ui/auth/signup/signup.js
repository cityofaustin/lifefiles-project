(function (mypass) {
  'use strict';

  mypass.signup = signup;
  mypass.regmodule('signup', '/ui/auth/signup/signup.html', 'onSignupLoad',mypass.Events.APP_NAV.signup);

  function init() {
    window.addEventListener('onSignupLoad', onSignupLoad);
  }

  function onSignupLoad(evt) {
    setTimeout(function () {
      $('.signup button.create-acct').on('click',signup);
    }, 1000);
  }

  function signup(evt) {
    // console.log('signup');
    
    var req={
        email:signupform.elements.email.value,
        first:signupform.elements.firstname.value,
        last:signupform.elements.lastname.value,
        password:signupform.elements.password.value
    };
    mypass.datacontext.account.register(req).then(onregister);
  }

  function onregister(res) {
    
  }


  init();

})(mypass);