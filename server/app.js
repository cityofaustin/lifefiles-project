var
  express = require('express'),
  path = require('path'),
  favicon = require('serve-favicon'),
  bodyParser = require('body-parser'),
  app = express(),
  fs = require('fs'),
  http = require('http'),
  env = require('node-env-file'),
  controllers = require('./controllers'),
  appconfig=require('./appconfig'),
  common=require('./common')
  ;

  
// view engine setup
var fs = require('fs');
app.engine('html', function (filePath, options, callback) {
  // define the template engine
  //console.log('app.engine(html...'+filePath);
  fs.readFile(filePath, function (err, content) {
    if (err) return callback(new Error(err));
    // this is an extremely simple template engine
    var rendered = content.toString();
    return callback(null, rendered);
  });
});
app.set('views', '../webclient/ui');
app.set('view engine', 'html');

app.use(favicon(path.join(__dirname, '../webclient/images/', 'favicon.ico')));
app.use(express.static('../webclient/'));
app.use(express.static('../webclient/'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

controllers.init(app);

env('./envVars.txt');

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
