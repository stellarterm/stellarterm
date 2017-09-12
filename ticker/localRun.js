'use strict';

const tickerGenerator = require('./tickerGenerator');
const fs = require('fs');

tickerGenerator()
  .then(result => {
    fs.writeFileSync('output.json', result, 'utf8');
  })
