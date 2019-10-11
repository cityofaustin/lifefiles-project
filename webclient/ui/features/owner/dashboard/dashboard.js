(function (mypass) {
  'use strict';

  mypass.registerFeature({
    name: 'ownerdashboard',
    url: '/ui/features/owner/dashboard/index.html',
    load: dashboardLoad,
    methods: {
      showInfo: showInfo,
      showMain:showMain
    }
  });

  function init() {
  }

  function dashboardLoad(evt) {
    $('.btn-logout').removeClass('hidden');
    mypass.ownerdashboard.main.load('.ownerdashboard .main');
  
  }

  function showInfo() {
    mypass.ownerdashboard.edit.load('.ownerdashboard .main');
  }

  function showMain() {
    $('.ownerdashboard .nav a').removeClass('active');
    mypass.ownerdashboard.main.load('.ownerdashboard .main');
  }


  init();

})(mypass);