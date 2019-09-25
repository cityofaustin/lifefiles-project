(function (mypass) {	
  'use strict';	

  mypass.registerFeature({	
    name: 'dashboard',	
    url: '/ui/features/dashboard/index.html',	
    load: dashboardLoad,	
    methods: {	
      editForm: editForm,	
      save: save,	
    }	
  });	

  function init() {	
  }	

  function dashboardLoad(evt) {	
    //ADD ANY PAGE CODE	
    $('.btn-logout').removeClass('hidden');	
    var account = mypass.session.getSession();	
    userform.elements.email.value = account.email;	
    userform.elements.firstname.value = account.first_name;	
    userform.elements.lastname.value = account.last_name;	
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


  init();	

})(mypass); 