(function (mypass) {
  'use strict';

  mypass.registerFeature({
    name: 'ownerdashboard',
    url: '/ui/features/owner/dashboard/index.html',
    load: dashboardLoad,
    methods: {
      showInfo: showInfo,
      showMain:showMain,
      showDocs:showDocs
    }
  });

  function init() {
    $('.ownerdashboard .nav a').on('click', function (e) {
      e.preventDefault();
      clearnav();
      $(this).addClass('active');
    });
  }

  function dashboardLoad(evt) {
    $('.btn-logout').removeClass('hidden');
    mypass.ownerdashboard.main.load('.ownerdashboard .main');
  }

  function showInfo() {
    mypass.ownerdashboard.edit.load('.ownerdashboard .main');
  }

  function showMain() {
    clearnav();
    mypass.ownerdashboard.main.load('.ownerdashboard .main');
  }

  function showDocs() {
    clearnav();
    // viewdocs
    mypass.ownerdashboard.doclist.load('.ownerdashboard .main');
  }

  function clearnav() {
    $('.ownerdashboard .nav a').removeClass('active');
  }


  setTimeout(init,1200);

})(mypass);