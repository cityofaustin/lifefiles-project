(function (mypass) {
  'use strict';

  mypass.registerFeature({
    name: 'agentdashboard',
    url: '/ui/features/agent/dashboard/index.html',
    load: dashboardLoad,
    methods: {
      editForm: editForm,
      save: save,
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

    mypass.datacontext.agent.getVerifiablePayload().then(function (response) {
      $('#cred-info').text( response.did );
    });
  }

  function editForm(edit) {
    if(edit==false){
      $('.user-info input').attr('readonly', 'readonly');
      mypass.formhelper.hideElement('.btncancel,.btnsave');
      mypass.formhelper.showElement('.btnedit');
    }
    else{
      $('.user-info input').removeAttr('readonly');
      mypass.formhelper.hideElement('.btncancel,.btnedit');
      mypass.formhelper.showElement('.btncancel,.btnsave');
    }
    
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
      var account = mypass.session.getSession();
      account.AccountInfo.name = userform.elements.name.value;
      mypass.session.updateSession(account);
    }
    else {
      //error
    }
  }


  init();

})(mypass);