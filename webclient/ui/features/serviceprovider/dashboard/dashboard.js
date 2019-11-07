(function (mypass) {
  'use strict';

  mypass.registerFeature({
    name: 'sp_dashboard',
    url: '/ui/features/serviceprovider/dashboard/index.html',
    load: dashboardLoad,
    methods: {
      showInfo: showInfo,
      showOwners: showOwners,
      showMain:showMain
    }
  });

  function init() {
    $('.sp-dashboard .nav a').on('click', function (e) {
      e.preventDefault();
      $('.sp-dashboard .nav a').removeClass('active');
      $(this).addClass('active');
    });
  }

  function dashboardLoad() {
    $('.btn-logout').removeClass('hidden');
    mypass.sp_dashboard.main.load('.sp-dashboard .main');
  }

  function showOwners() {
    mypass.sp_dashboard.owners.load('.sp-dashboard .main');
  }

  function showInfo() {
    mypass.sp_dashboard.edit.load('.sp-dashboard .main');
  }

  function showMain() {
    $('.sp-dashboard .nav a').removeClass('active');
    mypass.sp_dashboard.main.load('.sp-dashboard .main');
  }

  setTimeout(init,1200);



  init();

})(mypass);