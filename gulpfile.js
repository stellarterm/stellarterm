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
const argv = require('yargs').argv;
const config = require('./env-config.json');

const reload = browserSync.reload;
// Default task
gulp.task('default', ['clean', 'configEnv', 'buildDirectory', 'developApi', 'watch']);

// Clean
gulp.task('clean', (cb) => {
    cb(del.sync(['dist']));
});

// Styles
gulp.task('styles', () => gulp.src('./src/components/App.scss')
        .pipe($.sass().on('error', $.sass.logError))
        .pipe(gulp.dest('./dist/css')));

// Images (For big images that get turned into base64)
gulp.task('images', (cb) => {
    let imagesCollection = fs
        .readdirSync('./images/')
        .reduce((collection, fileName) => {
            const [name, extension] = fileName.split('.');

            const mimeType = extension === 'jpg' ? 'jpeg' : extension;
            const file = fs.readFileSync(`./images/${fileName}`);
            const b64 = Buffer.from(file).toString('base64');
            return `${collection}    '${name}': 'data:image/${mimeType};base64, ${b64}',\n`;
        }, 'const images = {\n');

    imagesCollection += '};\nmodule.exports = images;\n';
    fs.writeFile('./src/images.js', imagesCollection, cb);
});


// Build time config only for CUSTOM builds of StellarTerm
gulp.task('customConfig', (cb) => {
    let configFile = '\n// This file generated during the gulp build process.\n';
    configFile += 'window.stCustomConfig = ';

    const configObj = {};
    if (process.env.STELLARTERM_CUSTOM_HORIZON_URL) {
        configObj.horizonUrl = process.env.STELLARTERM_CUSTOM_HORIZON_URL;

        if (configObj.horizonUrl.indexOf('http') !== 0) {
            throw new Error(`STELLARTERM_CUSTOM_HORIZON_URL environment variable must begin with http. Got: ${process.env.STELLARTERM_CUSTOM_HORIZON_URL}`);
        }

        if (configObj.horizonUrl.substr(-1) === '/') {
            throw new Error(`STELLARTERM_CUSTOM_HORIZON_URL must not have a trailing slash. Got: ${process.env.STELLARTERM_CUSTOM_HORIZON_URL}`);
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
    if (!fs.existsSync('./dist')) {
        fs.mkdirSync('./dist');
    }
    fs.writeFile('./dist/customConfig.js', configFile, cb);
});

function getEnvironment() {
    let deployEnv;
    if (process.env.CONTEXT === 'production') {
        deployEnv = 'production';
    } else if (process.env.CONTEXT === 'branch-deploy' && process.env.BRANCH === 'staging') {
        deployEnv = 'staging';
    }
    return deployEnv || process.env.NODE_ENV || argv.env || 'local';
}

gulp.task('configEnv', (cb) => {
    const ENV = getEnvironment();
    const envData = config[ENV];
    const envConfig = Object
        .entries(envData)
        .reduce((resultConfig, pair) => `${resultConfig}export const ${pair[0]} = ${JSON.stringify(pair[1])};\n`, '');
    fs.writeFile('./src/env-consts.js', envConfig, cb);
});

// Build time information
gulp.task('buildInfo', (cb) => {
    let buildInfo = '\n// This file generated during the gulp build process.\n';
    buildInfo += 'window.stBuildInfo = ';

    const infoObj = {};

    infoObj.version = parseInt(execSync('git rev-list --count HEAD').toString().trim(), 10);


    buildInfo += JSON.stringify(infoObj, null, 2);
    buildInfo += ';\n';
    if (!fs.existsSync('./dist')) {
        fs.mkdirSync('./dist');
    }
    fs.writeFile('./dist/buildInfo.js', buildInfo, cb);
});

// browserify
const bundler = watchify(browserify({
    entries: ['./src/components/App.jsx'],
    extensions: ['.jsx'],
    debug: true,
    insertGlobals: true,
    cache: {},
    packageCache: {},
    fullPaths: false,
    insertGlobalVars: {
        horizonUrl() {
            return '';
        },
    },
}));
const rebundle = () => bundler.bundle()
    // log errors if they happen
    .on('error', (e) => {
        console.log(e.stack);
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

const baseTasks = ['html', 'styles', 'customConfig', 'buildInfo', 'images', 'scripts', 'copyBower', 'copyStaticFiles'];

// Watch
gulp.task('watch', baseTasks, () => {
    browserSync({
        notify: false,
        logPrefix: 'BS',
        server: ['dist'],
        https: true,
    });
    gulp.watch('./src/index.html', ['html-reload']);
    gulp.watch(['src/**/*.scss'], ['css-reload']);
    gulp.watch(['src/directory.js', 'directory/logos/**/*'], ['buildDirectory', 'developApi']);
});

const bsReload = (done) => {
    browserSync.reload();
    done();
};

gulp.task('developApi', (cb) => {
    const env = getEnvironment();

    if (env !== 'local') {
        cb();
        return;
    }

    execSync('(cd ./api/ && ./testTicker.sh)');
    gulp
        .src('./api/output/**/*.json')
        .pipe(gulp.dest('dist/api'))
        .on('end', cb);
});

gulp.task('buildDirectory', (cb) => {
    execSync('(cd ./directory/ && ./buildLogos.js && ./buildDirectory.js)');
    cb();
});

gulp.task('html-reload', ['html'], bsReload);
gulp.task('css-reload', ['styles'], bsReload);

gulp.task('copyBower', () => gulp.src('bower_components/**/*')
    .pipe(gulp.dest('dist/bower_components/')));

gulp.task('copyStaticFiles', () => gulp.src('static/**/*', { dot: true })
    .pipe(gulp.dest('dist/')));

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
        'configEnv',
        'buildDirectory',
        baseTasks,
        'uglify-js',
        'inlinesource'
        , () => {
            process.exit();
        });
});