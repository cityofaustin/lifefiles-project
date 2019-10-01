var
  express = require('express'),
  path = require('path'),
  favicon = require('serve-favicon'),
  bodyParser = require('body-parser'),
  app = express(),
  fs = require('fs'),
  http = require('http'),
  env = require('node-env-file'),
  controllers = require('./controllers'), //OUR CONTROLLERS THAT LISTEN FOR MESSAGES ON URLS
  appconfig=require('./appconfig'),
  common=require('./common'),
  cookieParser = require('cookie-parser'),
  compress = require('compression'),
  expressValidator = require('express-validator'),
  helmet = require('helmet'),
  session = require('express-session'),
  passport = require('passport')
  ;

  
// VIEW ENGINE SETUP...LISTENS FOR HTML FILE REQUESTS AND RETURNS THE HTML FILES
var fs = require('fs');
app.engine('html', function (filePath, options, callback) {
  //console.log('app.engine(html...'+filePath);
  fs.readFile(filePath, function (err, content) {
    if (err) return callback(new Error(err));
    // THIS IS AN EXTREMELY SIMPLE TEMPLATE ENGINE
    var rendered = content.toString();  //SEND BACK THE HTML FILE
    return callback(null, rendered);
  });
});
app.set('views', '../webclient/ui');  //WHERE TO LOOK FOR HTML FILES
app.set('view engine', 'html');

app.use(favicon(path.join(__dirname, '../webclient/images/', 'favicon.ico')));  //WHERE TO FIND IMAGE FILES
app.use(express.static('../webclient/'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compress());
// app.use(expressValidator);
app.use(helmet());
app.disable('x-powered-by');

// WE DONT RELY ON SESSIONS BUT THIS IS BASIC SESSION SETUP DATA
//IF APP IS DEPLOYED IN A LOAD BALANCED ENVIRONMENT FOR MULTIPLE SERVER INSTANCES THEN EITHER REMOVE SESSION CODE
//OR ATTACH A SESSION DATA STORE 
var sessConfig={
  secret: 'wowkdendje8j3e7dhry54fi4n4',
  resave: false,
  saveUninitialized: true,
  unset:'destroy'
};

if (app.get('env') === 'production') {
  app.set('trust proxy', 1); // trust first proxy...FOR REVERSE PROXY DEPLOYMENTS SUCH AS FOR USE WITH NGINX WEB SERVERS
  sessConfig.cookie={
    secure:true
  };
}

app.use(session(sessConfig)); //BASIC SESSIONS THAT WE DONT NEED BUT CAN USE 
app.use(passport.initialize()); 
//PASSPORT IS A HELPFUL MOD FOR HANDLING AUTHENTICATION AND IS VERY HELP FOR EXTENDING AUTHENTICATION
//SCENARIOS SUCH AS LOGIN WITH GOOGLE ACCOUNT

controllers.init(app);  //ATTACH OUR CONTROLERS

env('./envVars.txt'); //LOAD ENVIRONMENT VARIABLES

var port = normalizePort(process.env.SERVER_PORT);
app.set('port', port);

var server = http.createServer(app);
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

function normalizePort(val) {
  var port = parseInt(val, 10);
  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
}


function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  log('Listening on ' + bind);
}

function log(msg) {
  console.log('app.js...' + msg);
}

module.exports = app;
