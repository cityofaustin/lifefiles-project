(function (mypass) {
  'use strict';

  mypass.registerFeature({
    name: 'dashboard', 
    url:'/ui/features/dashboard/index.html' , 
    loadEvent: 'onDashboardLoad', 
    navEvent: mypass.Events.APP_NAV.dashboard 
  });

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