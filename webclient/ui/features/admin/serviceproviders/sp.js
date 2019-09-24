(function (mypass) {
  'use strict';

  mypass.registerFeatureChild({
    parent:'admindashboard',
    name: 'serviceproviders',
    url: '/ui/features/admin/serviceproviders/index.html',
    methods: {
      // editForm: editForm,
      // save: save,
      load: loadScreen,
    }
  });


  function loadScreen(parentElement) {
    //ADD ANY PAGE CODE
    $('.btn-logout').removeClass('hidden');

    $(parentElement).empty();
    $(parentElement).append(mypass.admindashboard.serviceproviders.template);

    // var account = mypass.session.getSession();
    // if (account.AccountInfo) {
    //   userform.elements.email.value = account.email;
    //   userform.elements.name.value = account.AccountInfo.name;
    //   userform.elements.organization.value = account.AccountInfo.organization;
    // }

  }

  // function editForm(edit) {
  //   if(edit==false){
  //     $('.user-info input').attr('readonly', 'readonly');
  //     mypass.formhelper.hideElement('.btncancel,.btnsave');
  //     mypass.formhelper.showElement('.btnedit');
  //   }
  //   else{
  //     $('.user-info input').removeAttr('readonly');
  //     mypass.formhelper.hideElement('.btncancel,.btnedit');
  //     mypass.formhelper.showElement('.btncancel,.btnsave');
  //   }
    
  // }


  // function save() {
  //   var req = {
  //     email: userform.elements.email.value,
  //     name: userform.elements.name.value,
  //     organization: userform.elements.organization.value
  //   };
  //   mypass.datacontext.administrator.save(req).then(onsave);
  // }

  // function onsave(res) {
  //   if (res.success) {
  //     $('.user-info input').attr('readonly', 'readonly');

  //     var account = mypass.session.getSession();
  //     account.email = userform.elements.email.value;
  //     account.AccountInfo.name = userform.elements.name.value;
  //     account.AccountInfo.organization = userform.elements.organization.value;
  //     mypass.session.updateSession(account);
  //   }
  //   else {
  //     //error
  //   }
  // }




})(mypass);