const { execSync } = require('child_process');
const { Compilation } = require('webpack');

module.exports = class CreateBuildInfo {
    // eslint-disable-next-line class-methods-use-this
    apply(compiler) {
        compiler.hooks.compilation.tap('CreateBuildInfo', compilation => {
            let buildInfo = '\n// This file generated during the gulp build process.\n';
            buildInfo += 'window.stBuildInfo = ';

            const infoObj = {};

            infoObj.version = parseInt(execSync('git rev-list --count HEAD').toString().trim(), 10);


            buildInfo += JSON.stringify(infoObj, null, 2);
            buildInfo += ';\n';

            compilation.hooks.processAssets.tap(
                {
                    name: 'CreateBuildInfo',
                    stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONS,
                },
                assets => {
                    // eslint-disable-next-line no-param-reassign
                    assets['buildInfo.js'] = {
                        source() {
                            return buildInfo;
                        },
                        size() {
                            return buildInfo.length;
                        },
                    };
                },
            );
        });
    }
};
