/* jshint node:true */
'use strict';

var gulp = require('gulp');
var karma = require('karma').server;
var argv = require('yargs').argv;
var $ = require('gulp-load-plugins')();

gulp.task('styles', function() {
  return gulp.src('app/styles/main.less')
    .pipe($.plumber())
    .pipe($.less())
    .pipe($.autoprefixer({browsers: ['last 1 version']}))
    .pipe(gulp.dest('.tmp/styles'));
});

gulp.task('jshint', function() {
  return gulp.src('app/scripts/**/*.js')
    .pipe($.jshint())
    //.pipe($.jshint.reporter('jshint-stylish'))
    //.pipe($.jshint.reporter('fail'));
});

// gulp.task('jscs', function() {
//   return gulp.src('app/scripts/**/*.js')
//     .pipe($.jscs());
// });

gulp.task('html', ['styles'], function() {
  var lazypipe = require('lazypipe');
  var cssChannel = lazypipe()
    .pipe($.csso)
    .pipe($.replace, 'bower_components/bootstrap/fonts', 'fonts');

  var assets = $.useref.assets({searchPath: '{.tmp,app}'});

  return gulp.src('app/**/*.html')
    .pipe(assets)
    .pipe($.if('*.js', $.ngAnnotate()))
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', cssChannel()))
    .pipe(assets.restore())
    .pipe($.useref())
    .pipe($.if('*.html', $.htmlmin({collapseWhitespace: true})))
    .pipe(gulp.dest('dist'));
});

gulp.task('images', function() {
  return gulp.src('app/images/**/*')
    // .pipe($.cache($.imagemin({
    //   progressive: true,
    //   interlaced: true
    // })))
    .pipe(gulp.dest('dist/images'));
});

gulp.task('fonts', function() {
  return gulp.src(require('main-bower-files')().concat('app/fonts/**/*')
    .concat('bower_components/bootstrap/fonts/*'))
    .pipe($.filter('**/*.{eot,svg,ttf,woff,woff2}'))
    .pipe($.flatten())
    .pipe(gulp.dest('dist/fonts'))
    .pipe(gulp.dest('.tmp/fonts'));
});

gulp.task('extras', function() {
  return gulp.src([
    'app/*.*',
    '!app/*.html',
    'node_modules/apache-server-configs/dist/.htaccess'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'));
});

gulp.task('clean', require('del').bind(null, ['.tmp', 'dist']));

gulp.task('connect', ['styles'], function() {
  var serveStatic = require('serve-static');
  var serveIndex = require('serve-index');
  var app = require('connect')()
    .use(require('connect-livereload')({port: 35729}))
    .use(serveStatic('.tmp'))
    .use(serveStatic('app'))
    // paths to bower_components should be relative to the current file
    // e.g. in app/index.html you should use ../bower_components
    .use('/bower_components', serveStatic('bower_components'))
    .use(serveIndex('app'));

  require('http').createServer(app)
    .listen(8000)
    .on('listening', function() {
      console.log('Started connect web server on http://localhost:8000');
    });
});

gulp.task('serve', ['wiredep', 'connect', 'fonts', 'watch'], function() {
  if (argv.open) {
    require('opn')('http://localhost:8000');
  }
});

gulp.task('test', function(done) {
  karma.start({
    configFile: __dirname + '/test/karma.conf.js',
    singleRun: true
  }, done);
});

// inject bower components
gulp.task('wiredep', function() {
  var wiredep = require('wiredep').stream;
  var exclude = [
    'bootstrap',
    'jquery',
    'es5-shim',
    'json3',
    'angular-scenario'
  ];

  gulp.src('app/styles/*.less')
    .pipe(wiredep())
    .pipe(gulp.dest('app/styles'));

  gulp.src('app/*.html')
    .pipe(wiredep({exclude: exclude}))
    .pipe(gulp.dest('app'));

  gulp.src('test/*.js')
    .pipe(wiredep({exclude: exclude, devDependencies: true}))
    .pipe(gulp.dest('test'));
});

gulp.task('watch', ['connect'], function() {
  $.livereload.listen();

  // watch for changes
  gulp.watch([
    'app/**/*.html',
    '.tmp/styles/**/*.css',
    'app/scripts/**/*.js',
    'app/images/**/*'
  ]).on('change', $.livereload.changed);

  gulp.watch('app/styles/**/*.less', ['styles']);
  gulp.watch('bower.json', ['wiredep']);
});

gulp.task('builddist', ['jshint', 'html', 'images', 'fonts', 'extras'],
  function() {
  return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('build', ['clean'], function() {
  gulp.start('builddist');
});

gulp.task('docs', [], function() {
  return gulp.src('app/scripts/**/**')
    .pipe($.ngdocs.process())
    .pipe(gulp.dest('./docs'));
});
