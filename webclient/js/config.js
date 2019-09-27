//any app configs
(function (mypass) {
  'use strict';

  mypass.Events = {
      APP_NAV:{
        nav:'appnav',
        loggedout:'nav.logout',
      },
      APP_STATUS:{
        session:{
          ready:'s.ready'
        },
        booted:'mypass.booted'
      }
  };

  function init() {
  }

  init();

})(mypass);