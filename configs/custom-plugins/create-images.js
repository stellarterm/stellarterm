const svgToMiniDataURI = require('mini-svg-data-uri');
const fs = require('fs');

module.exports = class CreateImages {
    constructor() {
        this.hasRun = false;
    }
    apply(compiler) {
        compiler.hooks.compilation.tap('CreateImages', () => {
            if (this.hasRun) {
                return;
            }
            fs.rmSync('./src/images.js', { force: true });
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
            fs.writeFile('./src/images.js', imagesCollection, () => {
                this.hasRun = true;
            });
        });
    }
};
