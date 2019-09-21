(function (mypass) {
  'use strict';

  mypass.registerFeature({
    name: 'dashboard',
    url: '/ui/features/dashboard/index.html',
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
    var acc = mypass.session.getSession();
    userform.elements.email.value = acc.email;
    userform.elements.firstname.value = acc.first_name;
    userform.elements.lastname.value = acc.last_name;
  }

  function editForm() {
    $('.user-info input').removeAttr('readonly');
  }

  function save() {
    var req = {
      email: userform.elements.email.value,
      first_name: userform.elements.firstname.value,
      last_name: userform.elements.lastname.value
    };
    mypass.datacontext.account.save(req).then(onsave);
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
    mypass.datacontext.account.deleteAccount().then(ondeleteAccount);
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