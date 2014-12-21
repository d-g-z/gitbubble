var gulp = require('gulp');
var less = require('gulp-less');
var uglify = require('gulp-uglify');
var minifyCss = require('gulp-minify-css');
var deploy = require('gulp-gh-pages');
var preprocess = require('gulp-preprocess');
var browserify = require('browserify');
var browserSync = require('browser-sync');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var hbsfy = require('hbsfy');
var del = require('del');

var defaultPort = '9000';
var defaultApiAddress = 'http://127.0.0.1:3000';

gulp.task('preprocess', function () {
  return gulp.src('app/env.js')
    .pipe(preprocess({context: { APIADDRESS: process.env.APIADDRESS || defaultApiAddress }}))
    .pipe(uglify())
    .pipe(gulp.dest('app/js/'));
});

gulp.task('style', function () {
  return gulp.src('app/style/*.less')
    .pipe(less())
    .pipe(minifyCss())
    .pipe(gulp.dest('app/css/'));
});

gulp.task('script', function () {
  return browserify('./app/script/app.js')
    .bundle()
    .pipe(source('main.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest('app/js/'));
});

gulp.task('watch', function () {
  gulp.watch('app/style/*.less', ['style']);
  gulp.watch([
    'app/hbs/*.hbs',
    'app/script/**.*'
  ], ['script']);
});

gulp.task('server', ['preprocess', 'style', 'script', 'watch'], function () {
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

gulp.task('dist', ['clean', 'preprocess', 'style', 'script'], function () {
  return gulp.src([
    'app/index.html',
    'app/css/**/*',
    'app/js/**/*',
    'app/font/**/*',
    'app/image/**/*'
  ], {
    base: './app/'
  }).pipe(gulp.dest('dist'));
});


gulp.task('deploy', ['dist'], function () {
  return gulp.src('dist/**/*')
    .pipe(deploy({
      branch: 'gitcafe-pages'
    }));
});

gulp.task('default', ['server']);
