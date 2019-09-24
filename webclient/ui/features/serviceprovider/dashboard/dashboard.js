(function (mypass) {
  'use strict';

  mypass.registerFeature({
    name: 'sp_dashboard',
    url: '/ui/features/serviceprovider/dashboard/index.html',
    load: dashboardLoad,
    methods: {
      editForm: editForm,
      save: save,
      // deleteAccount: deleteAccount
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
      userform.elements.companyname.value = account.AccountInfo.company_name;
      userform.elements.address.value = account.AccountInfo.address;
    }
  }

  function editForm() {
    $('.user-info input').removeAttr('readonly');
  }

  function save() {
    var req = {
      name: userform.elements.name.value,
      company_name: userform.elements.companyname.value,
      address: userform.elements.address.value
    };
    mypass.datacontext.serviceprovider.save(req).then(onsave);
  }

  function onsave(res) {
    if (res.success) {
      $('.user-info input').attr('readonly', 'readonly');

      var account = mypass.session.getSession();
      account.AccountInfo.name = userform.elements.name.value;
      account.AccountInfo.company_name = userform.elements.companyname.value;
      account.AccountInfo.address = userform.elements.address.value;
      mypass.session.updateSession(account);

    }
    else {
      //error
    }
  }

  // function deleteAccount() {
  //   //FOR DEMO PURPOSES ONLY...WONT USE IN PRODUCTION
  //   mypass.datacontext.serviceprovider.deleteAccount().then(ondeleteAccount);
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