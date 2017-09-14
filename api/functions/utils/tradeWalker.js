const _ = require('lodash');
const StellarSdk = require('stellar-sdk');

let tradeWalker = {};

// Walks until we hit pastSeconds in the past
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

  let tradeCalls = Server.orderbook(baseBuyingSdk, counterSellingSdk).trades().limit(100).order('desc').call()
  let processResults = tradeResults => {
    _.each(tradeResults.records, res => {
      let tradeTime = Date.parse(res.created_at)/1000
      if (start - tradeTime > pastSeconds) {
        satisfied = true;
      }
      if (satisfied) {
        return;
      }

      // Make sure our catch is good: https://github.com/stellar/horizon/issues/396
      // De Morgan, you cant confuse us if we don't try to use your laws!!! Ok this is already confusing
      if (
        !(
          (res.bought_asset_type === 'native' && baseBuying.code === 'XLM' && baseBuying.issuer === null)
            ||
          (res.bought_asset_code === baseBuying.code && res.bought_asset_issuer === baseBuying.issuer)
        )
        ||
        !(
          (res.sold_asset_type === 'native' && counterSelling.code === 'XLM' && counterSelling.issuer === null)
            ||
          (res.sold_asset_code === counterSelling.code && res.sold_asset_issuer === counterSelling.issuer)
        )
      ) {
        return;
      }

      let processedTrade = {
        tradeTime,
        boughtAmount: parseFloat(res.bought_amount),
        soldAmount: parseFloat(res.sold_amount),
      }
      processedTrade.price = _.round(processedTrade.boughtAmount/processedTrade.soldAmount, 7);

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
