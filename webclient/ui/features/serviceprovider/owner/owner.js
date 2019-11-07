(function (mypass) {
  'use strict';

  mypass.registerFeatureChild({
    parent: 'sp_dashboard',
    name: 'owner',
    url: '/ui/features/serviceprovider/owner/index.html',
    methods: {
      editForm: editForm,
      save: save,
      load: loadDashboard,
      addNew: addNew,
      cancel: cancel,
      delete: deleteRow
    }
  });

  var __hasData;

  function loadDashboard(parentElement, nofetch) {
    $('.btn-logout').removeClass('hidden');
    $(parentElement).empty();
    $(parentElement).append(mypass.sp_dashboard.owner.template);
    if (!nofetch) {
      getData();
    }
    __hasData = false;
  }

  function getData() {
    mypass.datacontext.owner.getAll().then(OnGetOwners);
  }


  function OnGetOwners(res) {
    if (res.success) {
      __hasData = true;
      mypass.formhelper.showElement('.owner .navbar');
      mypass.formhelper.bindTableRows('.owner-list', res.data);
    }
  }

  function addNew() {
    mypass.formhelper.hideElement('.owner .navbar');
    mypass.formhelper.hideElement('.owner-list');
    mypass.formhelper.showElement('.owner-view');
    editForm();
  }

  function editForm(edit) {
    if (edit == false) {
      $('.owner-view .user-info input').attr('readonly', 'readonly');
      mypass.formhelper.hideElement('.btncancel,.btnsave');
      mypass.formhelper.showElement('.btnedit');
    }
    else {
      $('.owner-view .user-info input').removeAttr('readonly');
      mypass.formhelper.hideElement('.btncancel,.btnedit');
      mypass.formhelper.showElement('.btncancel,.btnsave');
    }

  }


  function save() {
    var req = {
      email: ownerform.elements.email.value,
      first_name: ownerform.elements.firstname.value,
      last_name: ownerform.elements.lastname.value,
      company_name: ownerform.elements.companyname.value,
      address: ownerform.elements.address.value,
      isnew: true
    };
    mypass.datacontext.owner.save(req).then(onsave);
  }

  function onsave(res) {
    if (res.success) {
      $('.owner-view .user-info input').attr('readonly', 'readonly');
      mypass.formhelper.hideElement('.owner-view');
      mypass.formhelper.showElement('.owner-list');
      mypass.datacontext.owner.getAll().then(OnGetOwners);
    }
    else {
      //error
    }
  }

  function cancel() {
    if (!__hasData) {
      getData();
    }
    mypass.formhelper.hideElement('.owner-view');
    mypass.formhelper.showElement('.owner-list');
    mypass.formhelper.showElement('.owner .navbar');
  }

  function deleteRow(ctrl) {
    var req = {
      ownerkey: ctrl.getAttribute('data-key')
    };
    mypass.datacontext.owner.deleteAccount(req).then(getData);
  }


})(mypass);