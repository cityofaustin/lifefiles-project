(function (mypass) {
  'use strict';

  mypass.registerFeatureChild({
    parent: 'sp_dashboard',
    name: 'owner',
    url: '/ui/features/serviceprovider/owner/index.html',
    methods: {
      save: save,
      load: loadDashboard,
      addNew: addNew,
      cancel: cancel,
      delete: deleteRow,
      edit: editOwner
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

  function editForm(edit, data) {
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

    if (data) {
      ownerform.elements.name.value = data.Owner.name;

      mypass.sp_dashboard.doclist.load('.docs', data);
    }

  }


  function save() {
    var req = {
      name: ownerform.elements.name.value,
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
      primarykey: ctrl.getAttribute('data-key')
    };
    mypass.datacontext.owner.deleteAccount(req).then(getData);
  }

  function editOwner(ctrl) {
    var req = {
      primarykey: ctrl.getAttribute('data-key')
    };
    mypass.datacontext.owner.getOwner(req).then(onGetOwner);
  }

  function onGetOwner(res) {
    if (res.success) {
      mypass.formhelper.hideElement('.owner .navbar');
      mypass.formhelper.hideElement('.owner-list');
      mypass.formhelper.showElement('.owner-view');
      editForm(false, res.data);
    }
  }


})(mypass);