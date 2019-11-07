(function (mypass) {
  'use strict';

  mypass.registerFeatureChild({
    parent: 'sp_dashboard',
    name: 'main',
    url: '/ui/features/serviceprovider/main/index.html',
    methods: {
      load: loadDashboard,
      addOwner:addOwner
    }
  });


  function loadDashboard(parentElement) {
    $('.btn-logout').removeClass('hidden');
    $(parentElement).empty();
    $(parentElement).append(mypass.sp_dashboard.main.template);
  }

  function addOwner() {
    $('.sp-dashboard .nav a').removeClass('active');
    $('.sp-dashboard .nav a.sp').addClass('active');
    mypass.sp_dashboard.serviceproviders.load('.sp-dashboard .main',true);
    // mypass.sp_dashboard.serviceproviders.addNew();
  }

  

})(mypass);