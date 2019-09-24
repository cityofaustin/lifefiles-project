(function (mypass) {
  'use strict';

  mypass.registerFeature({
    name: 'signup', 
    url:'/ui/auth/signup/signup.html' , 
    load: signupLoad,
    methods:{
      signup:signup,
      checkPasswords:checkPasswords
    } 
  });

  function init() {
  }

  function signupLoad() {
      // $('.signup button.create-acct').on('click',signup);
  }

  function signup(evt) {
    mypass.validation.hideErrorLabel(['lbl-email','lbl-first','lbl-last','lbl-pass','lbl-passmatch']);

    var req={
        email:signupform.elements.email.value,
        first:signupform.elements.firstname.value,
        last:signupform.elements.lastname.value,
        password:signupform.elements.password.value
    };
    var emailChk = req.email.match(/^[a-z0-9!#$%&'*+/=?^_`{|}~.-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i);

    if(!req.email || !emailChk){
      mypass.validation.showErrorLabel('lbl-email');
    }
    else if(!req.first){
      mypass.validation.showErrorLabel('lbl-first');
    }
    else if(!req.last){
      mypass.validation.showErrorLabel('lbl-last');
    }
    else if(!req.password){
      mypass.validation.showErrorLabel('lbl-pass');
    }
    else{
      mypass.datacontext.auth.register(req).then(onregister);
    }
    
  }

  function onregister(res) {
    if(res.success){
      mypass.session.startSession(res.data);
      mypass.goto.dashboard();
    }
  }

  function checkPasswords(label) {
    if(signupform.elements.confpassword.value != signupform.elements.password.value){
      mypass.validation.showErrorLabel(label);
    }
    else{
      mypass.validation.hideErrorLabel(label);
    }
    
  }


  init();

})(mypass);