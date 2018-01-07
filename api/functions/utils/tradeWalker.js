const _ = require('lodash');
const StellarSdk = require('stellar-sdk');

let tradeWalker = {};

function matchesAsset(res, tradeType, asset) {
  let prefix;
  if (tradeType === 'bought') {
    prefix = 'bought';
  } else if (tradeType === 'sold') {
    prefix = 'sold';
  } else {
    throw new TypeError('tradeType argument for matchesAsset is supposed to be either bought or sold');
  }

  return (res[prefix + '_asset_type'] === 'native' && asset.code === 'XLM' && asset.issuer === null)
    ||
  (res[prefix + '_asset_code'] === asset.code && res[prefix + '_asset_issuer'] === asset.issuer);
}

// Walks until we hit pastSeconds in the past
// Will also rectify the trades
tradeWalker.walkUntil = function walkUntil(Server, baseBuying, counterSelling, pastSeconds) {
  let records = [];
  let satisfied = false;
  let start = new Date() / 1000;
  let first = true;
  let depth = 0;
  const MAX_DEPTH = 5;
  let prevCall;

  let baseBuyingSdk = new StellarSdk.Asset(baseBuying.code, baseBuying.issuer);
  let counterSellingSdk = new StellarSdk.Asset(counterSelling.code, counterSelling.issuer);

  let tradeCalls = Server.trades().forAssetPair(baseBuyingSdk, counterSellingSdk).limit(200).order('desc').call()
  let processResults = tradeResults => {
    _.each(tradeResults.records, res => {
      let tradeTime = Date.parse(res.ledger_close_time)/1000
      if (start - tradeTime > pastSeconds) {
        satisfied = true;
      }
      if (satisfied) {
        return;
      }

      let processedTrade = {
        tradeTime,
      }

      processedTrade.type = res.base_is_seller ? 'sell' : 'buy';
      processedTrade.baseAmount = parseFloat(res.base_amount);
      processedTrade.counterAmount = parseFloat(res.counter_amount);
      processedTrade.price = _.round(processedTrade.counterAmount/processedTrade.baseAmount, 7);

      records.push(processedTrade);
    })

    if (satisfied) {
      return;
    }
    return tradeResults.next().then(processResults);
  }

  return tradeCalls.then(processResults)
  .then(() => {
    return records;
  })



  // Potential optimization: If we load the horizon results into the array in the correct order
  // then sorting will run at near optimal runtime

  // First sort it in reverse so that we can filter
  this.trades.sort((a,b) => {
    return b[0]-a[0];
  });

  // Iterate on trades from new to old
  // Remove trades that are greater than OUTLIER_THRESHOLD times the previous value
  const OUTLIER_THRESHOLD = 3;
  let lastAmount = this.trades[0];
  this.trades = _.filter(this.trades, (entry) => {
    let currentAmount = entry[1];
    let ratio = (currentAmount > lastAmount) ? currentAmount/lastAmount :  lastAmount/currentAmount;
    if (ratio > OUTLIER_THRESHOLD) {
      return false;
    }
    lastAmount = currentAmount;
    return true;
  });
  _.reverse(this.trades);
}

module.exports = tradeWalker;
