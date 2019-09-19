(function (mypass) {
  'use strict';

  mypass.registerFeature({
    name: 'dashboard',
    url: '/ui/features/dashboard/index.html',
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
    var acc = mypass.session.getSession();
    userform.elements.email.value = acc.email;
    userform.elements.firstname.value = acc.firstname;
    userform.elements.lastname.value = acc.lastname;
  }

  function editForm() {
    $('.user-info input').removeAttr('readonly');
  }

  function save() {
    var acc = mypass.session.getSession();
    // userform.elements.email.value = acc.email;
    // userform.elements.firstname.value = acc.firstname;
    // userform.elements.lastname.value = acc.lastname;
    var req = {
      email: userform.elements.email.value,
      first_name: userform.elements.firstname.value,
      last_name: userform.elements.lastname.value
    };
    mypass.datacontext.membership.save(req).then(onsave);
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