var
  account=require('./account'),
  owner=require('./owner'),
  serviceprovider=require('./serviceprovider'),
  administrator=require('./administrator'),
  agent=require('./agent')
  upload=require('./upload')
  ;

exports.init = function(app) {
  account.init(app);
  owner.init(app);
  serviceprovider.init(app);
  administrator.init(app);
  agent.init(app);
  upload.init(app);
};

