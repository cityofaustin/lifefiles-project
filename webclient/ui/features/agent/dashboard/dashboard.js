(function (mypass) {
  'use strict';

  mypass.registerFeature({
    name: 'agentdashboard',
    url: '/ui/features/agent/dashboard/index.html',
    load: dashboardLoad,
    methods: {
      editForm: editForm,
      save: save,
      deleteAccount:deleteAccount
    }
  });

  function init() {
  }

  function dashboardLoad(evt) {
    //ADD ANY PAGE CODE
    $('.btn-logout').removeClass('hidden');
    var account = mypass.session.getSession();
  
    if (account.AccountInfo) {
      userform.elements.name.value = account.AccountInfo.name;
    }

  }

  function editForm() {
    $('.user-info input').removeAttr('readonly');
  }

  function save() {
    var req = {
      name: userform.elements.name.value
    };
    mypass.datacontext.agent.save(req).then(onsave);
  }

  function onsave(res) {
    if (res.success) {
      $('.user-info input').attr('readonly', 'readonly');
    }
    else {
      //error
    }
  }

  function deleteAccount() {
    //FOR DEMO PURPOSES ONLY...WONT USE IN PRODUCTION
    mypass.datacontext.agent.deleteAccount().then(ondeleteAccount);
  }

  function ondeleteAccount(res) {
    if (res.success) {
      mypass.session.logout();
    }
    else {
      //error
    }
  }

  init();

})(mypass);