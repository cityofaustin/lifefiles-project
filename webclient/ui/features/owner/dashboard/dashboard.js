(function (mypass) {
  'use strict';

  mypass.registerFeature({
    name: 'ownerdashboard',
    url: '/ui/features/owner/dashboard/index.html',
    load: dashboardLoad,
    methods: {
      editForm: editForm,
      save: save,
      // deleteAccount:deleteAccount
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
    mypass.datacontext.owner.save(req).then(onsave);
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

  // function deleteAccount() {
  //   //FOR DEMO PURPOSES ONLY...WONT USE IN PRODUCTION
  //   mypass.datacontext.owner.deleteAccount().then(ondeleteAccount);
  // }

  // function ondeleteAccount(res) {
  //   if (res.success) {
  //     mypass.session.logout();
  //   }
  //   else {
  //     //error
  //   }
  // }

  init();

})(mypass);