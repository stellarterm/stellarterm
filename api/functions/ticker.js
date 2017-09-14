const Promise = require('bluebird');
const _ = require('lodash');
const rp = require('request-promise');
const StellarSdk = require('stellar-sdk');
const niceRound = require('./utils/niceRound');

const PQueue = require('p-queue');
const queue = new PQueue({concurrency: 20});
const run = queue.add;

const directory = require('../directory.json');

StellarSdk.Network.usePublicNetwork();

Server = new StellarSdk.Server('https://horizon.stellar.org');
StellarSdk.Network.usePublicNetwork();

function tickerGenerator() {
  let finish;
  let ticker = {
    _meta: {
      start: Math.floor(Date.now()/1000),
      startISO: Date(),
      apiLicense: 'Apache-2.0',
    },
  };

  let tickerPromise = Promise.resolve()
    .then(() => phase1(ticker))
    .then(() => loadAssets(ticker))
    .then(() => phase3(ticker))
    .then(() => {
      return {
        'v1/ticker.json': JSON.stringify(ticker, null, 2)
      };
    })

  return tickerPromise;
}

function phase1(ticker) {
  return Promise.all([
    getHorizonMain()
      .then(main => {
        ticker._meta.horizon = {
          core_latest_ledger: main.core_latest_ledger,
          network_passphrase: main.network_passphrase,
        }
      })
    ,
    getExternalPrices()
      .then(externalPrices => {
        ticker._meta.externalPrices = externalPrices;
      })
  ])
}

function loadAssets(ticker) {
  ticker.assets = [];

  ticker.assets.push({
    id: 'XLM-native',
    code: 'XLM',
    issuer: null,
    domain: 'native',
    slug: 'XLM-native',
    website: 'https://www.stellar.org/lumens/',
    price_XLM: 1, // LOL 1 dogecoin = 1 dogecoin; 1 lumen = 1 lumen
    price_USD: ticker._meta.externalPrices.USD_XLM,
  })
  _.each(directory.assets, (asset, id) => {
    let r = {};
    r.id = id;
    r.code = asset.code;
    r.issuer = asset.issuer;
    r.domain = asset.domain;
    r.slug = asset.code + '-' + asset.domain;
    r.website = directory.anchors[asset.domain].website;
    ticker.assets.push(r)
  });
}

function phase3(ticker) {
  ticker.pairs = {};
  _.each(directory.pairs, (pairData, id) => {
    ticker.pairs[id] = {
      baseBuying: pairData.baseBuying,
      counterSelling: pairData.counterSelling,
    };
  });

  return Promise.all(_.map(ticker.pairs, pair => {
    let baseBuying     = new StellarSdk.Asset(pair.baseBuying.code, pair.baseBuying.issuer);
    let counterSelling = new StellarSdk.Asset(pair.counterSelling.code, pair.counterSelling.issuer);
    return Server.orderbook(baseBuying, counterSelling).call()
      .then((res) => {
        if (res.bids.length === 0 || res.asks.length === 0) {
          return;
        }
        pair.bid = _.round(res.bids[0].price, 7);
        pair.ask = _.round(res.asks[0].price, 7);
        // pair.spread = _.round(1 - pair.bid/pair.ask, 4);
        pair.price = _.round((parseFloat(pair.bid) + parseFloat(pair.ask))/2, 7);
        if (baseBuying.isNative()) {
          asset = _.find(ticker.assets, {
            code: pair.counterSelling.code,
            issuer: pair.counterSelling.issuer,
          });
          asset.price_XLM = niceRound(1/pair.price);
          asset.price_USD = niceRound(1/pair.price * ticker._meta.externalPrices.USD_XLM);
        } else if (counterSelling.isNative()) {
          asset = _.find(ticker.assets, {
            code: pair.baseBuying.code,
            issuer: pair.baseBuying.issuer,
          });
          asset.price_XLM = niceRound(pair.price);
          asset.price_USD = niceRound(pair.price * ticker._meta.externalPrices.USD_XLM);
        }
      })
  }));
}

function getExternalPrices() {
  return Promise.all([
    getBtcPrice(),
    getLumenPrice(),
  ])
  .then(externalData => {
    return {
      USD_BTC: externalData[0],
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
