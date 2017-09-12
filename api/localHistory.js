const tickerGenerator = require('./functions/history');
const fs = require('fs');
const _ = require('lodash');
const mkdirp = require('mkdirp');

tickerGenerator()
  .then(files => {
    _.each(files, (contents, filename) => {
      mkdirp.sync('./output/v1/history');
      fs.writeFileSync('./output/' + filename, contents, 'utf8');
    })
  })
