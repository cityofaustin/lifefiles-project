(function (mypass) {
  'use strict';

  mypass.registerFeature({
    name: 'admindashboard',
    url: '/ui/features/admin/dashboard/index.html',
    load: dashboardLoad,
    methods: {
      showInfo: showInfo,
      showServiceProviders: showServiceProviders,
      showAgents: showAgents
    }
  });

  function dashboardLoad(evt) {
    $('.btn-logout').removeClass('hidden');
    mypass.admindashboard.edit.load('.admin-dashboard .main');
  }

  function showServiceProviders() {
    mypass.admindashboard.serviceproviders.load('.admin-dashboard .main');
  }

  function showAgents() {
    mypass.admindashboard.agents.load('.admin-dashboard .main');
  }

  function showInfo() {
    mypass.admindashboard.edit.load('.admin-dashboard .main');
  }



})(mypass);