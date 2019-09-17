(function (mypass) {
  'use strict';

  mypass.registerFeature({
    name: 'signup', 
    url:'/ui/auth/signup/signup.html' , 
    loadEvent: 'onSignupLoad', 
    navEvent: mypass.Events.APP_NAV.signup 
  });

  function init() {
    window.addEventListener('onSignupLoad', onSignupLoad);
  }

  function onSignupLoad(evt) {
    setTimeout(function () {
      $('.signup button.create-acct').on('click',signup);
      $('.signup button.login').on('click',login);
      
    }, 1000);
  }

  function signup(evt) {
    var req={
        email:signupform.elements.email.value,
        first:signupform.elements.firstname.value,
        last:signupform.elements.lastname.value,
        password:signupform.elements.password.value
    };
    mypass.datacontext.account.register(req).then(onregister);
  }

  function onregister(res) {
    if(res.success){
      mypass.session.startSession(res.data);
    }
  }

  function login(){

  }

  init();

})(mypass);