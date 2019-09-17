(function (mypass) {
  'use strict';

  mypass.Events = {
      APP_NAV:{
        nav:'appnav',
        signup:'nav.signup',
        login:'nav.login',
        loggedout:'nav.logout',
        dashboard:'nav.main'
      },
      APP_STATUS:{
        session:{
          ready:'s.ready'
        },
        booted:'mypass.booted'
      }
  };

  function init() {
    // window.addEventListener('onLoginLoad', onLoginLoad);
  }

  init();

})(mypass);