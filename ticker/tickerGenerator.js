const Promise = require('bluebird');
const _ = require('lodash');
const rp = require('request-promise');
const StellarSdk = require('stellar-sdk');
console.log(StellarSdk);


function tickerGenerator() {
  let finish;
  let tickerPromise = new Promise(function(resolve, reject){
    finish = resolve;
  });
  let result = {
    _meta: {
      start: Math.floor(Date.now()/1000),
      startISO: Date(),
    },
  };

  phase1(result)
    .then(() => {
      let finalJson = JSON.stringify(result, null, 2);
      finish(finalJson);
    })

  return tickerPromise;
}

function phase1(result) {
  return Promise.all([
    getHorizonMain()
      .then(main => {
        result._meta.horizon = {
          core_latest_ledger: main.core_latest_ledger,
          network_passphrase: main.network_passphrase,
        }
      })
    ,
    getExternalPrices()
      .then(externalPrices => {
        result._meta.externalPrices = externalPrices;
      })
  ])
}

function getExternalPrices() {
  return Promise.all([
    getBtcPrice(),
    getLumenPrice(),
  ])
  .then(externalData => {
    return {
      BTC: externalData[0],
      BTC_XLM: externalData[1],
      USD_XLM: _.round(externalData[0]*externalData[1],6),
    }
  })
}

function getBtcPrice() {
  return Promise.all([
    rp('https://api.coindesk.com/v1/bpi/currentprice.json')
      .then(data => {
        return _.round(JSON.parse(data).bpi.USD.rate_float, 3);
      })
      .catch(() => {
        return null;
      })
    ,
    rp('https://api.bitfinex.com/v2/ticker/tBTCUSD')
      .then(data => {
        return _.round(JSON.parse(data)[2], 3);
      })
      .catch(() => {
        return null;
      })
    ,
    rp('https://api.coinbase.com/v2/prices/spot?currency=USD')
      .then(data => {
        return _.round(JSON.parse(data).data.amount, 3);
      })
      .catch(() => {
        return null;
      })
    ,
    rp('https://api.kraken.com/0/public/Ticker?pair=XBTUSD')
      .then(data => {
        return _.round(JSON.parse(data).result.XXBTZUSD.c[0], 3);
      })
      .catch(() => {
        return null;
      })
  ])
  .then(allPrices => {
    return _.round(_.mean(_.filter(allPrices, price => price !== null)), 2);
  })
}

// Get lumen price in terms of btc
function getLumenPrice() {
  return Promise.all([
    rp('https://poloniex.com/public?command=returnTicker')
      .then(data => {
        return parseFloat(JSON.parse(data).BTC_STR.last);
      })
      .catch(() => {
        return null;
      })
    ,
    rp('https://bittrex.com/api/v1.1/public/getticker?market=BTC-XLM')
      .then(data => {
        return parseFloat(JSON.parse(data).result.Last);
      })
      .catch(() => {
        return null;
      })
    ,
    rp('https://api.kraken.com/0/public/Ticker?pair=XLMXBT')
      .then(data => {
        return parseFloat(JSON.parse(data).result.XXLMXXBT.c[0]);
      })
      .catch(() => {
        return null;
      })
  ])
  .then(allPrices => {
    return _.round(_.mean(_.filter(allPrices, price => price !== null)), 8);
  })
}

function getHorizonMain() {
  return rp('https://horizon.stellar.org/')
    .then(horizonMain => {
      return JSON.parse(horizonMain);
    })
}

module.exports = tickerGenerator;
