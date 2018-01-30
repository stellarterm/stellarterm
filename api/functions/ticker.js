const Promise = require('bluebird');
const _ = require('lodash');
const rp = require('request-promise');
const StellarSdk = require('stellar-sdk');
const niceRound = require('./utils/niceRound');
const tradeWalker = require('./utils/tradeWalker');

const PQueue = require('p-queue');
const queue = new PQueue({concurrency: 20});
const run = queue.add;

const directory = require('../directory.json');

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
    .then(() => phase4(ticker))
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

  let lumenVolumeXLM = 0;
  let lumenVolumeUSD = 0;

  return Promise.all(_.map(ticker.pairs, (pair, pairSlug) => {
    let baseBuying     = new StellarSdk.Asset(pair.baseBuying.code, pair.baseBuying.issuer);
    let counterSelling = new StellarSdk.Asset(pair.counterSelling.code, pair.counterSelling.issuer);

    let asset;
    if (baseBuying.isNative()) {
      let asset = _.find(ticker.assets, {
        code: pair.counterSelling.code,
        issuer: pair.counterSelling.issuer,
      });
      asset.topTradePairSlug = pairSlug;
    } else if (counterSelling.isNative()) {
      let asset = _.find(ticker.assets, {
        code: pair.baseBuying.code,
        issuer: pair.baseBuying.issuer,
      });
      asset.topTradePairSlug = pairSlug;
    }

    return Server.orderbook(baseBuying, counterSelling).call()
      .then((res) => {
        if (res.bids.length === 0 || res.asks.length === 0) {
          return;
        }
        pair.bid = _.round(res.bids[0].price, 7);
        pair.ask = _.round(res.asks[0].price, 7);
        pair.spread = _.round(1 - pair.bid/pair.ask, 4);
        pair.price = _.round((parseFloat(pair.bid) + parseFloat(pair.ask))/2, 7);

        // Depth of the market of both sides
        let sum10PercentBidAmounts = _.sumBy(res.bids, bid => {
          if (parseFloat(bid.price)/pair.price >= 0.9) {
            return parseFloat(bid.amount);
          }
          return 0;
        });
        let sum10PercentAskAmounts = _.sumBy(res.asks, ask => {
          if (parseFloat(ask.price)/pair.price <= 1.1) {
            return parseFloat(ask.amount);
          }
          return 0;
        });


        // We get the min so that it can't be gamed by the issuer making a large sell wall
        pair.depth10Amount = _.round(Math.min(sum10PercentBidAmounts, sum10PercentAskAmounts));

        return tradeWalker.walkUntil(Server, pair.baseBuying, pair.counterSelling, 86400)
          .then(tradesList => {
            pair.numTrades24h = tradesList.length;

            if (baseBuying.isNative()) {
              let asset = _.find(ticker.assets, {
                code: pair.counterSelling.code,
                issuer: pair.counterSelling.issuer,
              });
              // TODO: Add num trades for other trade pairs too
              asset.numTrades24h = pair.numTrades24h;
              asset.spread = pair.spread;
              asset.price_XLM = niceRound(1/pair.price);
              asset.price_USD = niceRound(1/pair.price * ticker._meta.externalPrices.USD_XLM);
              pair.volume24h_XLM = niceRound(_.sumBy(tradesList, 'baseAmount'));
              asset.volume24h_XLM = pair.volume24h_XLM;
              asset.volume24h_USD = niceRound(pair.volume24h_XLM * ticker._meta.externalPrices.USD_XLM);

              lumenVolumeXLM += pair.volume24h_XLM;
              lumenVolumeUSD += asset.volume24h_USD;
              asset.topTradePairSlug = pairSlug;

              asset.depth10_XLM = niceRound(pair.depth10Amount);
              asset.depth10_USD = niceRound(asset.depth10_XLM*ticker._meta.externalPrices.USD_XLM);

              asset.numBids = res.bids.length;
              asset.numAsks = res.asks.length;
            } else if (counterSelling.isNative()) {
              let asset = _.find(ticker.assets, {
                code: pair.baseBuying.code,
                issuer: pair.baseBuying.issuer,
              });
              // TODO: Add num trades for other trade pairs too
              asset.numTrades24h = pair.numTrades24h;
              asset.spread = pair.spread;
              asset.price_XLM = niceRound(pair.price);
              asset.price_USD = niceRound(pair.price * ticker._meta.externalPrices.USD_XLM);
              pair.volume24h_XLM = niceRound(_.sumBy(tradesList, 'counterAmount'));
              asset.volume24h_XLM = pair.volume24h_XLM;
              asset.volume24h_USD = niceRound(pair.volume24h_XLM * ticker._meta.externalPrices.USD_XLM);

              lumenVolumeXLM += pair.volume24h_XLM;
              lumenVolumeUSD += asset.volume24h_USD;
              asset.topTradePairSlug = pairSlug;

              // TODO: Make this more accurate. This is inaccurate by up to 10% because
              // when I flip it around here, I'm not accounting for the difference
              // in price relative to XLM
              asset.depth10_XLM = niceRound(pair.depth10Amount*pair.price);
              asset.depth10_USD = niceRound(asset.depth10_XLM*ticker._meta.externalPrices.USD_XLM);

              asset.numBids = res.bids.length;
              asset.numAsks = res.asks.length;
            }
          })
      })
  }))
  .then(() => {
    ticker.assets[0].volume24h_XLM = niceRound(lumenVolumeXLM);
    ticker.assets[0].volume24h_USD = niceRound(lumenVolumeUSD);
  });
}

function phase4(ticker) {
  // Assign a score to each asset
  _.each(ticker.assets, asset => {
    if (asset.id === 'XLM-native') {
      asset.activityScore = 100;
      return;
    }
    // Has orderbook info relating to XLM
    if (asset.price_XLM === undefined) {
      asset.activityScore = 0;
      return;
    }

    // Having the full amount of 20 bids and asks on each side is important since
    // it makes the market look like there is activity
    // It's a flat improvement so that even those without market makers can improve their ranking
    let numOffersScore = (asset.numBids + asset.numAsks)/20; // [0,2]

    // A bonus for having an average of up to 1 trade every 24 hours. Adds
    // more detail to the charts. However, we don't want to overemphasize taking
    // This is again to help assets with little activity
    let constantActivityBonus = Math.max(12, asset.numTrades24h)/24; // [0,0.5]

    // It's nice to at least show that there is something happening.
    // Just $100 volume gets the asset a nice bonus
    let nonzeroVolumeBonus = Math.max(1, asset.volume24h_USD/100); // [0,1]

    // For assets to do well, they don't need to have all the metrics so that
    // assets that dont do well in one category won't get punished.

    // Having good depth is SUPER important
    // Use a lower base log to make it easier to get depth points
    let depth10Score = 0.5 * (Math.log(2 + asset.depth10_USD)/Math.log(2) - 1); // [0, infinity]

    // Lets also add a linear component to depth score.
    // Again, we are emphasizing depth. Cap it at $100k.
    // $50k depth should cover the bases of small users.
    depth10Score += Math.min(10, asset.depth10_USD/10000); // += [0, 10]

    // Volume really helps! However, it's not as important as depth especially
    // since there are no pecentage fees on the Stellar network
    let volumeScore = Math.log10(10 + asset.volume24h_USD) - 1; // [0, infinity]

    // numTrades is helpful too. Especially the first few num trades are important!
    // But we want to encourage depth more than market taking
    let numTradesScore = Math.log10(10 + asset.numTrades24h) - 1;

    // We want the score to be slightly more stable, so just a little spread can negatively influence
    // It's also a easy fix for issuers. With a big spread, the other stuff is kinda useless
    // Helps distinguish between assets that only have offers and nothing much else
    let spreadPenalty = Math.pow((1-asset.spread), 5); // range: [0,1]

    asset.activityScore = spreadPenalty * (numOffersScore + depth10Score + volumeScore + numTradesScore);
  });

  ticker.assets.sort((a,b) => {
    return b.activityScore - a.activityScore;
  });

  _.each(ticker.assets, asset => {
    asset.activityScore = _.round(asset.activityScore, 3);
  })
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
