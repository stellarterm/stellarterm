/* eslint-disable import/no-extraneous-dependencies */
const gulp = require('gulp');
const del = require('del');
const runSequence = require('run-sequence');
const $ = {
  sass: require('gulp-sass'),
  useref: require('gulp-useref'),
  uglify: require('gulp-uglify'),
  inlineSource: require('gulp-inline-source'),
};
const browserify = require('browserify');
const watchify = require('watchify');
const source = require('vinyl-source-stream');
const browserSync = require('browser-sync');
const fs = require('fs');
const execSync = require('child_process').execSync;

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

    let image = fs.readFileSync(`./images/${name}.${extension}`);
    let b64 = new Buffer(image).toString('base64');
    file += `  '${name}': 'data:image/${mimeType};base64, ${b64}',\n`
  };


  addImage('ledger-app','png');
  addImage('ledger-nano-picture','jpg');
  addImage('ledger-nano-s-buttons','png');
  addImage('ledger-logo','png');


  file += '};\nmodule.exports = images;';
  fs.writeFile('./src/images.js', file, cb);
});


// Build time config only for CUSTOM builds of StellarTerm
gulp.task('customConfig', (cb) => {
  let configFile = '\n// This file generated during the gulp build process.\n';
  configFile += 'window.stCustomConfig = ';

  let configObj = {};
  if (process.env.STELLARTERM_CUSTOM_HORIZON_URL) {
    configObj.horizonUrl = process.env.STELLARTERM_CUSTOM_HORIZON_URL;

    if (configObj.horizonUrl.indexOf('http') !== 0) {
      throw new Error('STELLARTERM_CUSTOM_HORIZON_URL environment variable must begin with http. Got: ' + process.env.STELLARTERM_CUSTOM_HORIZON_URL);
    }

    if (configObj.horizonUrl.substr(-1) === '/') {
      throw new Error('STELLARTERM_CUSTOM_HORIZON_URL must not have a trailing slash. Got: ' + process.env.STELLARTERM_CUSTOM_HORIZON_URL);
    }
  }

  if (process.env.STELLARTERM_CUSTOM_NETWORK_PASSPHRASE) {
    if (!configObj.horizonUrl) {
      throw new Error('To use STELLARTERM_CUSTOM_NETWORK_PASSPHRASE, the environment variable STELLARTERM_CUSTOM_HORIZON_URL must also be set');
    }

    configObj.networkPassphrase = process.env.STELLARTERM_CUSTOM_NETWORK_PASSPHRASE;
  }

  configFile += JSON.stringify(configObj, null, 2);

  configFile += ';\n';
  try {
    fs.mkdirSync('./dist');
  } catch (e) {}
  fs.writeFile('./dist/customConfig.js', configFile, cb);
});

// Build time information
gulp.task('buildInfo', (cb) => {
  let buildInfo = '\n// This file generated during the gulp build process.\n';
  buildInfo += 'window.stBuildInfo = ';

  let infoObj = {};

  infoObj.version = parseInt(execSync('git rev-list --count HEAD').toString().trim());


  buildInfo += JSON.stringify(infoObj, null, 2);
  buildInfo += ';\n';
  try {
    fs.mkdirSync('./dist');
  } catch (e) {}
  fs.writeFile('./dist/buildInfo.js', buildInfo, cb);
});

// browserify
const bundler = watchify(browserify({
  entries: ['./src/app.jsx'],
  debug: true,
  insertGlobals: true,
  cache: {},
  packageCache: {},
  fullPaths: false,
  insertGlobalVars: {
    horizonUrl: function () { return ''; }
  }
}));
const rebundle = () => bundler.bundle()
    // log errors if they happen
    .on('error', (e) => {
      console.log(e.stack)
    })
    .pipe(source('app.js'))
    .pipe(gulp.dest('./dist/scripts'))
    .on('end', () => {
      reload();
    });
bundler.on('update', rebundle);
bundler.on('log', (e) => {
  console.log(e);
});
gulp.task('scripts', rebundle);

gulp.task('html', () => gulp.src('./src/index.html')
    .pipe(gulp.dest('dist')));

gulp.task('buildBundle', ['styles', 'buildScripts', 'moveLibraries'], () => gulp.src('./app/*.html')
    .pipe(gulp.useref.assets())
    .pipe(gulp.useref.restore())
    .pipe(gulp.useref())
    .pipe(gulp.dest('dist')));

const baseTasks = ['html', 'styles', 'customConfig', 'buildInfo', 'images', 'scripts', 'copyBower'];

// Watch
gulp.task('watch', baseTasks, () => {
  browserSync({
    notify: false,
    logPrefix: 'BS',
    server: ['dist'],
    https: true
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
