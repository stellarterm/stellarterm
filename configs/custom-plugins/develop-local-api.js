const fs = require('fs');
const { tickerDataGenerator } = require('stellarterm-api');


module.exports = class DevelopLocalAPI {
    constructor(hasApiKey) {
        this.hasApiKey = hasApiKey;
    }
    apply(compiler) {
        compiler.hooks.compilation.tap('DevelopLocalAPI', () => {
            if (!this.hasApiKey) {
                return;
            }
            const opts = {};
            opts.ignoreLog = true;
            tickerDataGenerator(opts).then(tickerData => {
                if (!fs.existsSync('./dist/api')) {
                    fs.mkdirSync('./dist/api');
                }
                if (!fs.existsSync('./dist/api/v1')) {
                    fs.mkdirSync('./dist/api/v1');
                }

                fs.writeFile('./dist/api/v1/ticker.json', tickerData, () => {});
            });
        });
    }
};
