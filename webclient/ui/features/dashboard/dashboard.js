(function (mypass) {
  'use strict';

  mypass.regmodule('dashboard', '/ui/features/dashboard/index.html', 'onDashboardLoad',mypass.Events.APP_NAV.dashboard);

  function init() {
    window.addEventListener('onDashboardLoad', onDashboardLoad);
  }

  function onDashboardLoad(evt) {
    setTimeout(function () {
      $('.dashboard button.btn-logout').on('click', function () {
        mypass.session.logout();

        
      });
    }, 500);
  }

  init();

})(mypass);