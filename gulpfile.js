var gulp = require('gulp');
var less = require('gulp-less');
var browserify = require('browserify');
var browserSync = require('browser-sync');
var source = require('vinyl-source-stream');
var hbsfy = require('hbsfy');
var del = require('del');

var defaultPort = '9000';

gulp.task('style', function () {
  return gulp.src('app/style/*.less')
    .pipe(less())
    .pipe(gulp.dest('app/css/'));
});

gulp.task('script', function () {
  return browserify('./app/script/app.js')
    .bundle()
    .pipe(source('main.js'))
    .pipe(gulp.dest('app/js/'));
});

gulp.task('watch', function () {
  gulp.watch('app/style/*.less', ['style']);
  gulp.watch([
    'app/hbs/*.hbs',
    'app/script/*.js'
  ], ['script']);
});

gulp.task('server', ['style', 'script', 'watch'], function () {
  browserSync({
    port:  process.env.PORT || defaultPort,
    baseDir: 'app',
    index: 'index.html',
    files: [
      'app/index.html',
      'app/css/*.css',
      'app/js/*.js',
      'app/hbs/*.hbs'
    ],
    server: {
      baseDir: 'app'
    },
    browser: 'default'
  });
});

gulp.task('clean', function () {
  return del([
    'app/css/*.css',
    'app/js/*.js'
  ]);
});

gulp.task('default', ['server']);
