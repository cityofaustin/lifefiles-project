
var 
common = require('../../common')
;


exports.createAccount=createAccount;

function createAccount(params) {
  return new Promise((resolve) => {
    permanent_api.createAccount(params).then(function (res) {
      var response = new common.response();
      if (!res.success){
        response.message='error ';
        response.success = false;
      }
      else {
        response.users = res.data && res.data.Rows? res.data.Rows:[];
        response.success = true;
      }
      resolve(response);
    });
  });
}