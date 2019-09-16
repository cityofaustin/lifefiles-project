var
   fs = require('fs')
  ,util = require("util")
  ;

var logger={};

logger.log = log;

function log(msg){

  // console.log('process.env.ENABLE_LOGGING ='+util.inspect(process.env.ENABLE_LOGGING ));
  if(process.env.ENABLE_LOGGING && process.env.ENABLE_LOGGING ==='true') {
    fs.appendFileSync(process.env.LOGFILENAME, new Date().toISOString() + ' - ' + msg + '\n');
  }
}


module.exports=logger;