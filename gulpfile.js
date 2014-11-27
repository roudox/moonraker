'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');

var paths = {
  sass: ['./lib/reporter/assets/scss/**/*.scss'],
  assets: './lib/reporter/assets/'
};

gulp.task('default', ['sass']);

gulp.task('sass', function(done) {
  gulp.src(paths.assets + 'scss/main.scss')
    .pipe(sass())
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest(paths.assets))
    .on('end', done);
});

gulp.task('watch', function() {
  gulp.watch(paths.sass, ['sass']);
});
