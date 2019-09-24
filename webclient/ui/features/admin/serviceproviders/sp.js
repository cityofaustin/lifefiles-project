(function (mypass) {
  'use strict';

  mypass.registerFeatureChild({
    parent: 'admindashboard',
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
    mypass.datacontext.serviceprovider.getAll().then(OnGetSps);

  }

  function OnGetSps(res) {
    if (res.success) {
      var dd = res.Rows;

      var str = new mypass.utils.StringBuilder();
      var rowTemplate = $('.sp-list table tbody tr:first')[0].outerHTML;
      var rowTemplateHlder = document.createComment(rowTemplate);
      
      $('.sp-list table tbody').empty();
      $('.sp-list table tbody').append(rowTemplateHlder);
      
      var temp = $(rowTemplate).clone();

      for (var index = 0; index < res.Rows.length; index++) {
        const element = res.Rows[index];

        var chrd = temp.children();
        for (var index = 0; index < chrd.length; index++) {
          var child = chrd[index];
          var prop = child.getAttribute('data-bind').split('.')[1];
          child.innerText=element[prop];
        }

      $('.sp-list table tbody').append(temp);
      }

      // $('.sp-list table tbody').empty();
      // $('.sp-list table tbody').append(str.toString());
      
//       accountid: 13
// address: "Austin, Tx"
// company_name: "mmmmmmmmmmm"
// name: "Jerry Service provider"
// primarykey: 1

      // <tr>
      //       <th scope="row">1</th>
      //       <td>Mark</td>
      //       <td>Otto</td>
      //       <td>@mdo</td>
      //     </tr>
          
    }
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