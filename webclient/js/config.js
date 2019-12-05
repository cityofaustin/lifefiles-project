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
        booted:'mypass.booted',
        startwaiting:'mypass.startwaiting',
        stopwaiting:'mypass.stopwaiting'
      }
  };

  function init() {
  }

  init();

})(mypass);