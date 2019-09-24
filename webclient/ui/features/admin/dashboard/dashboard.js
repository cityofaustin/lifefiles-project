(function (mypass) {
  'use strict';

  mypass.registerFeature({
    name: 'admindashboard',
    url: '/ui/features/admin/dashboard/index.html',
    load: dashboardLoad,
    methods: {
      editForm: editForm,
      save: save
    }
  });

  function init() {
  }

  function dashboardLoad(evt) {
    //ADD ANY PAGE CODE
    $('.btn-logout').removeClass('hidden');
    var account = mypass.session.getSession();

    if (account.AccountInfo) {
      userform.elements.email.value = account.email;
      userform.elements.name.value = account.AccountInfo.name;
      userform.elements.organization.value = account.AccountInfo.organization;
    }

  }

  function editForm() {
    $('.user-info input').removeAttr('readonly');
  }

  function save() {
    var req = {
      email: userform.elements.email.value,
      name: userform.elements.name.value,
      organization: userform.elements.organization.value
    };
    mypass.datacontext.administrator.save(req).then(onsave);
  }

  function onsave(res) {
    if (res.success) {
      $('.user-info input').attr('readonly', 'readonly');
    }
    else {
      //error
    }
  }



  init();

})(mypass);