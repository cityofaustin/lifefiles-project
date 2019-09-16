var
  mysql = require('mysql')
  ,logger=require('../common/logger')
  ,util = require("util")
  ,config = require("../config")
  ,fs = require('fs')
  ,_ = require('lodash')
  ,appconfig=require('../config/appsettings')
;

exports.GetConnection = GetConnection;
exports.GetResponse=GetResponse;

function GetConnection(dbInfo,multi) {
  var connection;

  //log('get connection');
  //log('get connectin ...process.env.NODE_ENV='+process.env.NODE_ENV);

  if(dbInfo){

    var opts={
      host: dbInfo.DbHost,
      user: dbInfo.DbLoginName,
      password: dbInfo.DbLoginPassword,
      database: dbInfo.DbName
    };

    if(multi){
      opts.multipleStatements=true;
    }

    if(process.env.NODE_ENV=='production' || process.env.NODE_ENV=='development') {
      opts.ssl = 'Amazon RDS';
    }
    connection = mysql.createConnection(opts);

  }
  else if(process.env.NODE_ENV == config.ENVIRONMENT.PROD){
    //log('config.AWS_CERT_PATH='+config.AWS_CERT_PATH);
    //var certfile=fs.readFileSync(config.AWS_CERT_PATH); //not used at this time
    connection = mysql.createConnection({
      host: appconfig.SETTINGS[process.env.NODE_ENV].host,
      user: appconfig.SETTINGS[process.env.NODE_ENV].user,
      password: appconfig.SETTINGS[process.env.NODE_ENV].password,
      database: appconfig.SETTINGS[process.env.NODE_ENV].database,
      ssl  : 'Amazon RDS'
    });
    //{ca : certfile}
  }
  else if(process.env.NODE_ENV == config.ENVIRONMENT.DEV){
    //log('config.AWS_CERT_PATH='+config.AWS_CERT_PATH);
    //var certfile=fs.readFileSync(config.AWS_CERT_PATH); //not used at this time
    connection = mysql.createConnection({
      host: appconfig.SETTINGS[process.env.NODE_ENV].host,
      user: appconfig.SETTINGS[process.env.NODE_ENV].user,
      password: appconfig.SETTINGS[process.env.NODE_ENV].password,
      database: appconfig.SETTINGS[process.env.NODE_ENV].database,
      ssl  : 'Amazon RDS'
    });
    //{ca : certfile}
  }
  else {
    connection = mysql.createConnection({
      host: appconfig.SETTINGS[process.env.NODE_ENV].host,
      user: appconfig.SETTINGS[process.env.NODE_ENV].user,
      password: appconfig.SETTINGS[process.env.NODE_ENV].password,
      database: appconfig.SETTINGS[process.env.NODE_ENV].database
    });
  }

  return connection;
}


function GetResponse(rows){
  //log('connection GetResponse before = '+util.inspect(rows));
  var res = rows[0][0];
  //log('GetResponse after = '+util.inspect(res[0]));
  //log('GetResponse after res.membershipid = '+res[0].membershipid);
  //var d = res[0];
  //log('GetResponse d = '+util.inspect(d));
  //log('GetResponse after d.membershipid = '+d.membershipid);
  //return d;
  return res;
}

function log(msg){
  logger.log('connection  logger = '+msg);
}
