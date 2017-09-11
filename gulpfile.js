/* eslint-disable import/no-extraneous-dependencies */
const gulp = require('gulp');
const del = require('del');
const runSequence = require('run-sequence');
const $ = require('gulp-load-plugins')();
const browserify = require('browserify');
const watchify = require('watchify');
const source = require('vinyl-source-stream');
const browserSync = require('browser-sync');
const fs = require('fs');
const mkdirp = require('mkdirp');

const reload = browserSync.reload;

// Default task
gulp.task('default', ['clean', 'watch']);

// Clean
gulp.task('clean', (cb) => {
  cb(del.sync(['dist']));
});

// Styles
gulp.task('styles', () => {
  return gulp.src('./src/styles/**/*.scss')
    .pipe($.sass().on('error', $.sass.logError))
    .pipe(gulp.dest('./dist/css'));
});

// Images (For big images that get turned into base64)
gulp.task('images', (cb) => {
  let file = 'let images = {\n';
  let addImage = (name, extension) => {
    // Known to support jpg, png, gif. Supports others if mime type matches extension
    let mimeType = extension;
    if (extension === 'jpg') {
      mimeType = 'jpeg';
    }

    let image = fs.readFileSync(`./images/${name}.${mimeType}`);
    let b64 = new Buffer(image).toString('base64');
    file += `  '${name}': 'data:image/${mimeType};base64, ${b64}',\n`
  };



  addImage('charts','png');
  addImage('order','png');
  addImage('send','png');
  addImage('github','png');



  file += '};\nmodule.exports = images;';
  fs.writeFile('./src/images.js', file, cb);
});

// Logos for the directory
gulp.task('logos', (cb) => {
  let file = 'let logos = {\n';

  fs.readdirSync('./logos')
    .filter(filename => {
      return filename.match(/\.png$/);
    })
    .forEach(filename => {
      let match = filename.match(/(.+)\.png$/);
      if (match === null) {
        return;
      }
      let logoName = match[1];

      // Unlike in the images task, we only support png
      let image = fs.readFileSync(`./logos/${filename}`);
      let b64 = new Buffer(image).toString('base64');
      file += `  '${logoName}': 'data:image/png;base64, ${b64}',\n`
    })

  // DONTDO: Useless and worthless optimization not worth pursuing: use Promise.all on fs instead of sync

  file += '};\nmodule.exports = logos;';
  fs.writeFile('./src/logos.js', file, cb);
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

gulp.task('html', () => gulp.src('./src/index.html')
    .pipe(gulp.dest('dist')));

gulp.task('buildBundle', ['styles', 'buildScripts', 'moveLibraries'], () => gulp.src('./app/*.html')
    .pipe($.useref.assets())
    .pipe($.useref.restore())
    .pipe($.useref())
    .pipe(gulp.dest('dist')));

const baseTasks = ['html', 'styles', 'images', 'logos', 'scripts', 'copyBower'];

// Watch
gulp.task('watch', baseTasks, () => {
  browserSync({
    notify: false,
    logPrefix: 'BS',
    server: ['dist'],
  });
  gulp.watch('./src/index.html', ['html-reload']);
  gulp.watch(['src/**/*.scss'], ['css-reload']);
});

const bsReload = (done) => {
  browserSync.reload();
  done();
};
gulp.task('html-reload', ['html'], bsReload);
gulp.task('css-reload', ['styles'], bsReload);

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

gulp.task('directoryToJson',  ['logos'], () => {
  let directory = require('./src/directory');

  mkdirp.sync('./dist/');
  mkdirp.sync('./ticker/in/');
  fs.writeFileSync('./dist/directory.json', directory.toJson());
  fs.writeFileSync('./ticker/in/directory.json', directory.toJson());
});
