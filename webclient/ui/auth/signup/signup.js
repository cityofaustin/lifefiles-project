(function (mypass) {
  'use strict';

  mypass.registerFeature({
    name: 'signup', 
    url:'/ui/auth/signup/signup.html' , 
    load: signupLoad,
    methods:{
      signup:signup
    } 
  });

  function init() {
  }

  function signupLoad() {
      // $('.signup button.create-acct').on('click',signup);
  }

  function signup(evt) {
    var req={
        email:signupform.elements.email.value,
        first:signupform.elements.firstname.value,
        last:signupform.elements.lastname.value,
        password:signupform.elements.password.value
    };
    mypass.datacontext.auth.register(req).then(onregister);
  }

  function onregister(res) {
    if(res.success){
      mypass.session.startSession(res.data);
      mypass.goto.dashboard();
    }
  }


  init();

})(mypass);