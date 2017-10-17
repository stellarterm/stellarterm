#!/usr/bin/env node
const fs = require('fs');

let logos = {};

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

    let image = fs.readFileSync(`./logos/${filename}`);
    let b64 = new Buffer(image).toString('base64');
    logos[logoName] = 'data:image/png;base64, ' + b64;
  })

fs.writeFileSync('./logos.json', JSON.stringify(logos,null,2));
