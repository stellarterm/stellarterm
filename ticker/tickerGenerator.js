let Promise = require('bluebird');

function tickerGenerator() {

  let result = {
    _meta: {
      start: Math.floor(Date.now()/1000),
      startISO: Date(),
      hello: 'world',
    },
  };

  let finalJson = JSON.stringify(result, null, 2);
  return Promise.resolve(finalJson);
}

module.exports = tickerGenerator;
