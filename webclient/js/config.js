(function (mypass) {
  'use strict';

  mypass.Events = {
      APP_NAV:{
        nav:'appnav',
        signup:'appnav.signup',
        login:'appnav.login'
      }
  };

  function init() {
    // window.addEventListener('onLoginLoad', onLoginLoad);
  }

  // function onLoginLoad(evt) {
  //   setTimeout(function () {
  //     $('.login button.login').on('click', function () {
  //       console.log('do login');
  //     });
  //     $('.login button.create-acct').on('click', function () {
  //       var event = new CustomEvent('app-nav',{page:'signup'});
  //       window.dispatchEvent(event);
  //     });
      
  //   }, 1000);
  // }



  init();

})(mypass);