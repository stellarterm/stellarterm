'use strict';

var gulp = require('gulp');
var del = require('del');


var runSequence = require('run-sequence');

// Load plugins
var $ = require('gulp-load-plugins')();
var browserify = require('browserify');
var watchify = require('watchify');
var source = require('vinyl-source-stream'),

    sourceFile = './app/scripts/app.js',

    destFolder = './dist/scripts',
    destFileName = 'app.js';

var browserSync = require('browser-sync');
var reload = browserSync.reload;




// Clean
gulp.task('clean', function(cb) {
    $.cache.clearAll();
    cb(del.sync(['dist']));
});

// Styles
gulp.task('styles', function(){
  gulp.src(['./app/styles/**/*.css'], { base: './app/styles/' })
  .pipe(gulp.dest('dist/styles'));
});



var bundler = watchify(browserify({
    entries: [sourceFile],
    debug: true,
    insertGlobals: true,
    cache: {},
    packageCache: {},
    fullPaths: false
}));

bundler.on('update', rebundle);
bundler.on('log', $.util.log);

function rebundle() {
    return bundler.bundle()
        // log errors if they happen
        .on('error', $.util.log.bind($.util, 'Browserify Error'))
        .pipe(source(destFileName))
        .pipe(gulp.dest(destFolder))
        .on('end', function() {
            reload();
        });
}

// Scripts
gulp.task('scripts', rebundle);

// gulp.task('buildScripts', function() {
//     return browserify(sourceFile)
//         .bundle()
//         .pipe(source(destFileName))
//         .pipe(gulp.dest('dist/scripts'));
// });




// HTML
gulp.task('html', function() {
    return gulp.src('app/*.html')
        // .pipe($.useref())
        .pipe(gulp.dest('dist'))
        // .pipe($.size());
});

// Images
// gulp.task('images', function() {
//     return gulp.src('app/images/**/*')
//         .pipe(gulp.dest('dist/images'))
//         .pipe($.size());
// });

// Fonts
// gulp.task('fonts', function() {

// });


// Bundle
// gulp.task('bundle', ['styles', 'scripts' /*, 'bower'*/], function() {
//     return gulp.src('./app/*.html')
//         // .pipe($.useref.assets())
//         // .pipe($.useref.restore())
//         // .pipe($.useref())
//         .pipe(gulp.dest('dist'));
// });

gulp.task('buildBundle', ['styles', 'buildScripts', 'moveLibraries' /*, 'bower'*/], function() {
    return gulp.src('./app/*.html')
        .pipe($.useref.assets())
        .pipe($.useref.restore())
        .pipe($.useref())
        .pipe(gulp.dest('dist'));
});

// // Move JS Files and Libraries
// gulp.task('copyBower', function(){
//   // the base option sets the relative root for the set of files,
//   // preserving the folder structure
//   gulp.src('./bower_components/**')
//   .pipe(gulp.dest('dist/bower_components/'));
// });


// Bower helper
// gulp.task('bower', function() {

// });

// gulp.task('json', function() {
//     gulp.src('app/scripts/json/**/*.json', {
//             base: 'app/scripts'
//         })
//         .pipe(gulp.dest('dist/scripts/'));
// });

// // Robots.txt and favicon.ico
// gulp.task('extras', function() {
//     return gulp.src(['app/*.txt', 'app/*.ico'])
//         .pipe(gulp.dest('dist/'))
//         .pipe($.size());
// });

// Watch
gulp.task('watch', ['html', 'scripts',/*'fonts', */], function() {
    browserSync({
        notify: false,
        logPrefix: 'BS',
        server: ['dist']
    });
    gulp.watch('app/*.html', ['html-reload']);
    gulp.watch(['app/styles/**/*.scss', 'app/styles/**/*.css'], ['css-reload']);
});

let bsReload = done => {
    browserSync.reload();
    done();
};
// gulp.task('json-reload', ['json'], bsReload);
gulp.task('html-reload', ['html'], bsReload);
gulp.task('css-reload', ['styles', 'scripts'], bsReload);


gulp.task('uglify-js', function() {
  return gulp.src('dist/scripts/app.js')
    .pipe($.uglify())
    // .pipe($.stripDebug())
    .pipe(gulp.dest('dist/scripts'))
    // .pipe($.exit())
});

gulp.task('inlinesource', function () {
    return gulp.src('./dist/index.html')
        .pipe($.inlineSource())
        .pipe(gulp.dest('./dist/'));
});

// Build production site.
gulp.task('production', function(cb) {
  process.env.NODE_ENV = 'production';
  runSequence(
    'clean',
    ['html', 'styles', 'scripts'],
    'uglify-js',
    'inlinesource'
    , function() {
      process.exit()
    })
});



// Default task
gulp.task('default', ['clean', 'watch'  ]);
