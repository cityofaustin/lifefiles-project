(function (mypass) {
  'use strict';

  mypass.registerFeatureChild({
    parent:'sp_dashboard',
    name: 'edit',
    url: '/ui/features/serviceprovider/edit/index.html',
    methods: {
      editForm: editForm,
      save: save,
      load: loadScreen,
    }
  });

  function init() {
  }

  function loadScreen(parentElement) {
    //ADD ANY PAGE CODE
    $('.btn-logout').removeClass('hidden');

    $(parentElement).empty();
    $(parentElement).append(mypass.sp_dashboard.edit.template);

    var account = mypass.session.getSession();

    if (account.AccountInfo) {
      userform.elements.name.value = account.AccountInfo.name;
      userform.elements.companyname.value = account.AccountInfo.company_name;
      userform.elements.address.value = account.AccountInfo.address;
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


  init();

})(mypass);