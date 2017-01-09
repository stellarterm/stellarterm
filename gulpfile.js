/* eslint-disable import/no-extraneous-dependencies */
const gulp = require('gulp');
const del = require('del');
const runSequence = require('run-sequence');
const $ = require('gulp-load-plugins')();
const browserify = require('browserify');
const watchify = require('watchify');
const source = require('vinyl-source-stream');
const browserSync = require('browser-sync');

const reload = browserSync.reload;

// Default task
gulp.task('default', ['clean', 'watch']);

// Clean
gulp.task('clean', (cb) => {
  cb(del.sync(['dist']));
});

// Styles
gulp.task('styles', () => {
  gulp.src(['./app/styles/**/*.css'], { base: './app/styles/' })
  .pipe(gulp.dest('dist/styles'));
});

// browserify
const bundler = watchify(browserify({
  entries: ['./src/app.jsx'],
  debug: true,
  insertGlobals: true,
  cache: {},
  packageCache: {},
  fullPaths: false,
}));
const rebundle = () => bundler.bundle()
    // log errors if they happen
    .on('error', $.util.log.bind($.util, 'Browserify Error'))
    .pipe(source('app.js'))
    .pipe(gulp.dest('./dist/scripts'))
    .on('end', () => {
      reload();
    });
bundler.on('update', rebundle);
bundler.on('log', $.util.log);
gulp.task('scripts', rebundle);

gulp.task('html', () => gulp.src('index.html')
    .pipe(gulp.dest('dist')));

gulp.task('buildBundle', ['styles', 'buildScripts', 'moveLibraries'], () => gulp.src('./app/*.html')
    .pipe($.useref.assets())
    .pipe($.useref.restore())
    .pipe($.useref())
    .pipe(gulp.dest('dist')));

const baseTasks = ['html', 'styles', 'scripts', 'copyBower'];

// Watch
gulp.task('watch', baseTasks, () => {
  browserSync({
    notify: false,
    logPrefix: 'BS',
    server: ['dist'],
  });
  gulp.watch('index.html', ['html-reload']);
  gulp.watch(['styles/**/*.scss', 'styles/**/*.css'], ['css-reload']);
});

const bsReload = (done) => {
  browserSync.reload();
  done();
};
gulp.task('html-reload', ['html'], bsReload);
gulp.task('css-reload', ['styles', 'scripts'], bsReload);

gulp.task('copyBower', () => gulp.src('bower_components/**/*')
    .pipe(gulp.dest('dist/bower_components/')));

// Build production site.
gulp.task('uglify-js', () => gulp.src('dist/scripts/app.js')
    .pipe($.uglify())
    .pipe(gulp.dest('dist/scripts')));

gulp.task('inlinesource', () => gulp.src('./dist/index.html')
    .pipe($.inlineSource())
    .pipe(gulp.dest('./dist/')));

gulp.task('production', () => {
  process.env.NODE_ENV = 'production';
  runSequence(
    'clean',
    baseTasks,
    'uglify-js',
    'inlinesource'
    , () => {
      process.exit();
    });
});
