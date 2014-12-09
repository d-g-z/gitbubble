var gulp = require('gulp');
var less = require('gulp-less');
var deploy = require('gulp-gitcafe-pages');
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
    'app/script/**.*'
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
    'dist/',
    'app/css/*.css',
    'app/js/*.js'
  ]);
});

gulp.task('dist', ['clean', 'style', 'script'], function () {
  gulp.src('app/index.html')
    .pipe(gulp.dest('dist/'));

  gulp.src('app/css/*.css')
    .pipe(gulp.dest('dist/css/'));

  gulp.src('app/js/*.js')
    .pipe(gulp.dest('dist/js/'));
});


gulp.task('deploy', function () {
  return gulp.src('dist/**/*')
    .pipe(deploy());
});

gulp.task('default', ['server']);
