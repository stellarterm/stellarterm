const config = require('../constants/env-config.json');
const fs = require('fs');
const dotenv = require('dotenv');


const wcProjectId = dotenv.config().parsed
    ? dotenv.config().parsed.WALLET_CONNECT_PROJECT_ID
    : null;

module.exports = class CreateEnvConsts {
    constructor(environment) {
        this.environment = environment;
        this.hasRun = false;
    }
    apply(compiler) {
        compiler.hooks.compilation.tap('CreateEnvConsts', () => {
            if (this.hasRun) {
                return; // Skip the generation
            }

            fs.rmSync('./src/env-consts.js', { force: true });

            const envConsts = config[this.environment];

            if (!process.env.WALLET_CONNECT_PROJECT_ID && !wcProjectId) {
                throw new Error('No WALLET_CONNECT_PROJECT_ID found. Please check your environment variables.');
            }

            envConsts.WALLET_CONNECT_PROJECT_ID = process.env.WALLET_CONNECT_PROJECT_ID || wcProjectId;

            const envConfig = Object
                .entries(envConsts)
                .reduce((resultConfig, pair) => `${resultConfig}export const ${pair[0]} = ${JSON.stringify(pair[1])};\n`, '');

            fs.writeFile('./src/env-consts.js', envConfig, () => {
                this.hasRun = true;
            });
        });
    }
};
