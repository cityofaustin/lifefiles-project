var
  gulp = require('gulp'),
   less = require('gulp-less'),
   concat = require('gulp-concat'),
   uglify = require('gulp-uglify'),
   gutil = require('gulp-util'),
   cleanCSS = require('gulp-clean-css'),
   minifyHTML = require('gulp-minify-html')
;

var isProduction = false;


exports.Server_All = Server_All;
function Server_All(cb) {
  
  var srcpaths = [
    'server/*.js',
    'server/**/*.js',
    'server/**/**',
    'server/*.txt',
    'server/*.json'
  ];

  gulp.src(srcpaths).on("error", handleError).pipe(gulp.dest('publish/server/'));

  if(cb){
    cb();
  }
}

exports.Web_ALL = gulp.series(Web_JS,Web_HTML,Web_CSS,Web_IMG,Web_Vendor);
exports.Web_html_js_css = gulp.series(Web_JS,Web_HTML,Web_CSS);

exports.Web_JS=Web_JS;
function Web_JS(cb) {
  var srcpaths = [
    'webclient/js/mypass.js',
    'webclient/js/config.js',
    'webclient/js/cache.js',
    'webclient/js/session.js',
    'webclient/js/datacontext.js',
    'webclient/ui/**/*.js',
    'webclient/js/appboot.js'
  ];
  //appboot.js must always be last in...this way the client app js gets event to know all code has loaded and is ready

  gulp.src(srcpaths)
    .pipe(concat('mypass.js'))
    .on("error", handleError)
    //.pipe(thisModule.useSourceMaps ? sourcemaps.write() : gutil.noop())
    .pipe(isProduction ? uglify({ mangle: false }) : gutil.noop())
    .pipe(gulp.dest('publish/webclient/js/'));

    if(cb){
      cb();
    }
}

exports.Web_Vendor=Web_Vendor;
function Web_Vendor(cb) {
  var srcpaths = [
    'webclient/vendor/jquery.min.js',
    'webclient/vendor/lodash.min.js',
    'webclient/vendor/moment.min.js',
  ];
  gulp.src(srcpaths).on("error", handleError).pipe(gulp.dest('publish/webclient/vendor/'));

  var srcpaths = [
    'webclient/vendor/bootstrap/dist*/**',
  ];

  gulp.src(srcpaths).on("error", handleError).pipe(gulp.dest('publish/webclient/vendor/bootstrap/'));

  var srcpaths = [
    'webclient/vendor/fontawesome/css*/**',
    'webclient/vendor/fontawesome/fonts*/**',
  ];

  gulp.src(srcpaths).on("error", handleError).pipe(gulp.dest('publish/webclient/vendor/fontawesome/'));

    if(cb){
      cb();
    }
}

exports.Web_HTML=Web_HTML;
function Web_HTML(cb) {
  var srcpaths = [
    'webclient/ui/**/*.html',
    '!webclient/ui/index.html',
  ];

  gulp.src(srcpaths)
    .on("error", handleError)
    .pipe(isProduction ? uglify({ mangle: false }) : gutil.noop())
    .pipe(gulp.dest('publish/webclient/ui'));

    var mainlanding=['webclient/ui/index.html'];
    gulp.src(mainlanding)
    .on("error", handleError)
    .pipe(isProduction ? uglify({ mangle: false }) : gutil.noop())
    .pipe(gulp.dest('publish/webclient/'));

    if(cb){
      cb();
    }
}


exports.Web_CSS=Web_CSS;
function Web_CSS(cb) {
  // , 'webclient/src/modules/**/*.less'
  var files = ['webclient/css/app.less','webclient/ui/**/*.less'];
  gulp.src(files)
    .pipe(less())
    .on("error", handleError)
    // .pipe(isProduction ? cleanCSS() : gutil.noop())
    // .pipe(uglify({ keep_fnames: true }))
    .pipe(concat('app.css'))
    .pipe(gulp.dest('publish/webclient/css/'));

    if(cb){
      cb();
    }
}


exports.Web_IMG=Web_IMG;
function Web_IMG(cb) {
  // , 'webclient/src/modules/**/*.less'
  var files = ['webclient/images/**'];
  gulp.src(files)
    .on("error", handleError)
    .pipe(gulp.dest('publish/webclient/images/'));

    if(cb){
      cb();
    }
}


function handleError(err) {
  console.log(err.toString());
  this.emit('end');
}