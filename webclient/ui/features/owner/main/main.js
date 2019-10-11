(function (mypass) {
  'use strict';

  mypass.registerFeatureChild({
    parent: 'ownerdashboard',
    name: 'main',
    url: '/ui/features/owner/main/index.html',
    methods: {
      load: loadDashboard,
    }
  });


  function loadDashboard(parentElement) {
    $('.btn-logout').removeClass('hidden');
    $(parentElement).empty();
    $(parentElement).append(mypass.ownerdashboard.main.template);
  }


})(mypass);