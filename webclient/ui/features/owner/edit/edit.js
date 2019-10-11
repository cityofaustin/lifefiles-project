(function (mypass) {
  'use strict';

  mypass.registerFeatureChild({
    parent:'ownerdashboard',
    name: 'edit',
    url: '/ui/features/owner/edit/index.html',
    methods: {
      editForm: editForm,
      save: save,
      load: loadScreen
    }
  });

  function init() {
  }

  function loadScreen(parentElement) {
    $('.btn-logout').removeClass('hidden');

    $(parentElement).empty();
    $(parentElement).append(mypass.ownerdashboard.edit.template);

    var account = mypass.session.getSession();
    if (account.AccountInfo) {
      userform.elements.name.value = account.AccountInfo.name;
    }

  }

  function editForm(edit) {
    if(edit==false){
      $('.ownerdashboard .user-info input').attr('readonly', 'readonly');
      mypass.formhelper.hideElement('.btncancel,.btnsave');
      mypass.formhelper.showElement('.btnedit');
    }
    else{
      $('.ownerdashboard .user-info input').removeAttr('readonly');
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
      $('.ownerdashboard .user-info input').attr('readonly', 'readonly');
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