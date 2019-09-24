(function (mypass) {
  'use strict';

  mypass.registerFeatureChild({
    parent:'admindashboard',
    name: 'agents',
    url: '/ui/features/admin/agents/index.html',
    methods: {
      load: loadScreen,
    }
  });

  
  function loadScreen(parentElement) {
    //ADD ANY PAGE CODE
    $('.btn-logout').removeClass('hidden');
    $(parentElement).empty();
    $(parentElement).append(mypass.admindashboard.agents.template);

  }

  

})(mypass);