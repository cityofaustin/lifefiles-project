(function (mypass) {
  'use strict';

  mypass.registerFeature({
    name: 'dashboard', 
    url:'/ui/features/dashboard/index.html' , 
    load: dashboardLoad
  });

  function init() {
  }

  function dashboardLoad(evt) {
      //ADD ANY PAGE CODE
  }

  init();

})(mypass);