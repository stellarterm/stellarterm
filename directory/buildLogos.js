#!/usr/bin/env node
const fs = require('fs');

const logos = {};

fs.readdirSync('./logos')
    .filter(filename => filename.match(/\.png$/))
    .forEach((filename) => {
        const match = filename.match(/(.+)\.png$/);
        if (match === null) {
            return;
        }
        const logoName = match[1];

        const image = fs.readFileSync(`./logos/${filename}`);
        const b64 = Buffer.from(image).toString('base64');
        logos[logoName] = `data:image/png;base64, ${b64}`;
    });

fs.writeFileSync('./logos.json', JSON.stringify(logos, null, 2));
