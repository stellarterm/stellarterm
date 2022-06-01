/* eslint-disable import/no-extraneous-dependencies */
const gulp = require('gulp');
const del = require('del');
const runSequence = require('run-sequence');
const babel = require('gulp-babel');
const imagemin = require('gulp-imagemin');
const svgToMiniDataURI = require('mini-svg-data-uri');

const $ = {
    sass: require('gulp-sass'),
    useref: require('gulp-useref'),
    uglify: require('gulp-uglify'),
    inlineSource: require('gulp-inline-source'),
};
const browserify = require('browserify');
const watchify = require('watchify');
const babelify = require('babelify');
const source = require('vinyl-source-stream');
const browserSync = require('browser-sync');
const browserSyncSpa = require('browser-sync-middleware-spa');

const indexPath = `${__dirname}/dist/index.html`;
const fs = require('fs');
const execSync = require('child_process').execSync;
const argv = require('yargs').argv;
const config = require('./env-config.json');
const envify = require('envify');

try {
    // !You need to add coin market cup key to your environment
    // eslint-disable-next-line import/no-unresolved,global-require
    require('./cmc-key');
    // eslint-disable-next-line no-empty
} catch (e) {}


const reload = browserSync.reload;
// Default task
gulp.task('default', ['clean', 'configEnv', 'developApi', 'buildImages', 'watch']);

// Clean
gulp.task('clean', cb => {
    cb(del.sync(['dist']));
});

// Styles
gulp.task('styles', () => gulp.src('./src/components/App.scss')
    .pipe($.sass().on('error', $.sass.logError))
    .pipe(gulp.dest('./dist/css')));


gulp.task('minifyImages', () =>
    gulp
        .src('./images/*')
        .pipe(
            imagemin([
                imagemin.gifsicle({ interlaced: true }),
                imagemin.jpegtran({ progressive: true }),
                imagemin.optipng({ optimizationLevel: 5 }),
                imagemin.svgo({
                    plugins: [{ removeViewBox: false }],
                }),
            ]),
        )
        .pipe(gulp.dest('./images/')),
);

// Images (For big images that get turned into base64)
gulp.task('encodeImages', cb => {
    let imagesCollection = fs.readdirSync('./images/').reduce((collection, fileName) => {
        const [name, extension] = fileName.split('.');
        const isVectorImg = extension === 'svg';
        const mimeType = extension === 'jpg' ? 'jpeg' : extension;
        const file = fs.readFileSync(`./images/${fileName}`);
        const b64 = Buffer.from(file).toString('base64');
        const svgUri = isVectorImg ? svgToMiniDataURI(Buffer.from(file).toString()) : null;

        const img = isVectorImg ? `"${svgUri}"` : `"data:image/${mimeType};base64, ${b64}"`;
        return `${collection} '${name}': ${img},\n`;
    }, 'const images = {\n');

    imagesCollection += '};\nmodule.exports = images;\n';
    fs.writeFile('./src/images.js', imagesCollection, cb);
});

gulp.task('buildImages', done => {
    runSequence('minifyImages', 'encodeImages', () => {
        done();
    });
});

// Build time config only for CUSTOM builds of StellarTerm
gulp.task('customConfig', cb => {
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
    const ENV = deployEnv || process.env.NODE_ENV || argv.env || 'local';
    if (ENV === 'local' && !process.env.COIN_MARKET_CUP_KEY) {
        console.warn('No COIN_MARKET_CUP_KEY found. Can not use local environment. Staging env will be used');
        return 'staging';
    }
    return ENV;
}

gulp.task('configEnv', cb => {
    const ENV = getEnvironment();
    const envData = config[ENV];
    const envConfig = Object
        .entries(envData)
        .reduce((resultConfig, pair) => `${resultConfig}export const ${pair[0]} = ${JSON.stringify(pair[1])};\n`, '');
    fs.writeFile('./src/env-consts.js', envConfig, cb);
});

// Build time information
gulp.task('buildInfo', cb => {
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
    entries: [
        './src/components/App.jsx',
        './node_modules/lightweight-charts',
    ],
    extensions: ['.jsx', '.js'],
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
}).transform(babelify.configure({
    presets: ['@babel/preset-env', '@babel/preset-react'],
    compact: true,
})));

if (process.env.WC_KEY) {
    bundler.transform('envify', {
        WC_KEY: process.env.WC_KEY,
    });
}

try {
    if (!process.env.WC_KEY) {
        // eslint-disable-next-line import/no-unresolved,global-require
        const wcKey = require('./.wc-key.json');
        // eslint-disable-next-line no-return-assign,consistent-return
        bundler.transform('envify', {
            WC_KEY: wcKey.WC_KEY,
        });
    }
} catch (e) {
    throw new Error('');
}


const rebundle = () => bundler.bundle()
    // log errors if they happen
    .on('error', e => {
        console.log(e.stack);
    })
    .pipe(source('app.js'))
    .pipe(gulp.dest('./dist/scripts'))
    .on('end', () => {
        reload();
    });
bundler.on('update', rebundle);
bundler.on('log', e => {
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

const baseTasks = ['html', 'styles', 'customConfig', 'buildInfo', 'scripts', 'copyStaticFiles'];

// Watch
gulp.task('watch', baseTasks, () => {
    browserSync({
        notify: false,
        logPrefix: 'BS',
        server: ['dist'],
        https: true,
        middleware: [browserSyncSpa(/exchange[^-]|^[^.]+$/, indexPath)],
    });
    gulp.watch('./src/index.html', ['html-reload']);
    gulp.watch(['src/**/*.scss'], ['css-reload']);
});

const bsReload = done => {
    browserSync.reload();
    done();
};

const { tickerDataGenerator } = require('stellarterm-api');

gulp.task('developApi', cb => {
    const env = getEnvironment();

    if (env !== 'local') {
        cb();
        return;
    }

    const opts = {};
    opts.ignoreLog = true;
    tickerDataGenerator(opts)
        .then(tickerData => {
            if (!fs.existsSync('./dist/api')) {
                fs.mkdirSync('./dist/api');
            }
            if (!fs.existsSync('./dist/api/v1')) {
                fs.mkdirSync('./dist/api/v1');
            }

            fs.writeFile('./dist/api/v1/ticker.json', tickerData, cb);
        });
});

gulp.task('html-reload', ['html'], bsReload);
gulp.task('css-reload', ['styles'], bsReload);

gulp.task('copyStaticFiles', () => gulp.src('static/**/*', { dot: true })
    .pipe(gulp.dest('dist/')));

// Build production site.
gulp.task('uglify-js', () => gulp.src('dist/scripts/app.js')
    .pipe(babel({
        presets: ['@babel/preset-env'],
        compact: true,
    }))
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
        'buildImages',
        baseTasks,
        'uglify-js',
        'inlinesource'
        , () => {
            process.exit();
        });
});
