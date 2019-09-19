var
  membership=require('./membership')
  ;

exports.init = function(app) {
  membership.init(app);
};

