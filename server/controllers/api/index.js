var
  account=require('./account')
  ;

exports.init = function(app) {
  account.init(app);
};

