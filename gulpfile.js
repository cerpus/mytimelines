var gulp       = require('gulp');
var gutil      = require('gulp-util');
var source     = require('vinyl-source-stream');
var sass       = require('gulp-sass');
var browserify = require('browserify');
var watchify   = require('watchify');

var bundler = watchify(browserify('./src/client/app.js', watchify.args));

gulp.task('app', bundle);
bundler.on('update', bundle);

function bundle() {
    return bundler.bundle()
        .on('error', gutil.log.bind(gutil, 'Browserify Error'))
        .pipe(source('bundle.js'))
        .pipe(gulp.dest('./public'));
}

gulp.task('sass', function () {
    gulp.src('./src/client/styles/*.scss')
        .pipe(sass())
        .pipe(gulp.dest('./public'));
});

gulp.task('watch', function () {
    gulp.watch('./src/client/styles/*.scss', ['sass']);
});

gulp.task('default', ['app', 'sass', 'watch']);
