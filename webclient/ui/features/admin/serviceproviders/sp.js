(function (mypass) {
  'use strict';

  mypass.registerFeatureChild({
    parent: 'admindashboard',
    name: 'serviceproviders',
    url: '/ui/features/admin/serviceproviders/index.html',
    methods: {
      editForm: editForm,
      save: save,
      load: loadDashboard,
      addNew: addNew,
      cancel:cancel
    }
  });

  var __hasData;

  function loadDashboard(parentElement,nofetch) {
    $('.btn-logout').removeClass('hidden');
    $(parentElement).empty();
    $(parentElement).append(mypass.admindashboard.serviceproviders.template);
    if(!nofetch){
      getData();
    }
    __hasData=false;
  }

  function getData() {
    mypass.datacontext.serviceprovider.getAll().then(OnGetSps);
  }


  function OnGetSps(res) {
    if (res.success) {
      __hasData=true;
      mypass.formhelper.showElement('.service-providers .navbar');
      mypass.formhelper.bindTableRows('.sp-list', res.Rows);
    }
  }

  function addNew() {
    mypass.formhelper.hideElement('.service-providers .navbar');
    mypass.formhelper.hideElement('.sp-list');
    mypass.formhelper.showElement('.sp-view');
    editForm();
  }

  function editForm(edit) {
    if (edit == false) {
      $('.sp-view .user-info input').attr('readonly', 'readonly');
      mypass.formhelper.hideElement('.btncancel,.btnsave');
      mypass.formhelper.showElement('.btnedit');
    }
    else {
      $('.sp-view .user-info input').removeAttr('readonly');
      mypass.formhelper.hideElement('.btncancel,.btnedit');
      mypass.formhelper.showElement('.btncancel,.btnsave');
    }

  }


  function save() {
    var req = {
      company_name: spform.elements.companyname.value,
      name: spform.elements.name.value,
      address: spform.elements.address.value,
      isnew: true
    };
    mypass.datacontext.serviceprovider.save(req).then(onsave);
  }

  function onsave(res) {
    if (res.success) {
      $('.sp-view .user-info input').attr('readonly', 'readonly');
      mypass.formhelper.hideElement('.sp-view');
      mypass.formhelper.showElement('.sp-list');
      mypass.datacontext.serviceprovider.getAll().then(OnGetSps);
    }
    else {
      //error
    }
  }

function cancel() {
  if(!__hasData){
    getData();
  }
  mypass.formhelper.hideElement('.sp-view');
  mypass.formhelper.showElement('.sp-list');
  mypass.formhelper.showElement('.service-providers .navbar');
}


})(mypass);