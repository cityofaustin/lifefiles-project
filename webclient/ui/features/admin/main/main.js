(function (mypass) {
  'use strict';

  mypass.registerFeatureChild({
    parent: 'admindashboard',
    name: 'main',
    url: '/ui/features/admin/main/index.html',
    methods: {
      load: loadDashboard,
      addSP:addSP,
      addAgent:addAgent
    }
  });


  function loadDashboard(parentElement) {
    $('.btn-logout').removeClass('hidden');
    $(parentElement).empty();
    $(parentElement).append(mypass.admindashboard.main.template);
  }

  function addSP() {
    $('.admin-dashboard .nav a').removeClass('active');
    $('.admin-dashboard .nav a.sp').addClass('active');
    mypass.admindashboard.serviceproviders.load('.admin-dashboard .main',true);
    mypass.admindashboard.serviceproviders.addNew();
  }

  function addAgent() {
    $('.admin-dashboard .nav a').removeClass('active');
    $('.admin-dashboard .nav a.agent').addClass('active');
    mypass.admindashboard.agents.load('.admin-dashboard .main');
  }


})(mypass);