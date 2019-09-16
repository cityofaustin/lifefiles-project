var
  
  accountAPI=require('./account')
 
  ;

exports.init = function(app) {
  accountAPI.init(app);
};

