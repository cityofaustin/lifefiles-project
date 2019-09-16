var
  home= require('./home'),
  api= require('./api')
  auth= require('./auth')
  ;

function init(app) {
  home.init(app);
  api.init(app);
  auth.init(app);
}

exports.init = init;