import _ from 'lodash';
import Stellarify from '../lib/Stellarify';
import BigNumber from 'bignumber.js';
import directory from '../directory';
const StellarLedger = window.StellarLedger;

// Spoonfed Stellar-SDK: Super easy to use higher level Stellar-Sdk functions
// Simplifies the objects to what is necessary. Listens to updates automagically.
// It's in the same file as the driver because the driver is the only one that
// should ever use the spoon.
const MagicSpoon = {
  async Account(Server, keypair, opts, onUpdate) {
    let sdkAccount = await Server.loadAccount(keypair.publicKey());
    this.bip32Path = opts.bip32Path;

    sdkAccount.signWithLedger = transaction => {
      console.log('Sending to Ledger to sign');
      return new StellarLedger.Api(new StellarLedger.comm(Number.MAX_VALUE)).signTx_async(this.bip32Path, transaction).then((result) => {
        const signature = result.signature;
        const hint = keypair.signatureHint();
        const decorated = new StellarSdk.xdr.DecoratedSignature({ hint, signature });
        transaction.signatures.push(decorated);
        return transaction;
      })
    };

    sdkAccount.signWithSecret = transaction => {
      console.log('Signing with local keypair');
      return transaction.sign(keypair);
    };

    sdkAccount.getLumenBalance = () => {
      return sdkAccount.balances[sdkAccount.balances.length - 1].balance;
    }

    // Expects StellarSdk.Asset
    // Returns null if there is no trust
    // Returns string of balance if exists
    sdkAccount.getBalance = (targetAsset) => {
      let targetBalance = null;
      if (targetAsset.isNative()) {
        _.each(sdkAccount.balances, balance => {
          if (balance.asset_type === 'native') {
            targetBalance = balance.balance;
          }
        });
      } else {
        _.each(sdkAccount.balances, balance => {
          if (balance.asset_code === targetAsset.getCode() && balance.asset_issuer === targetAsset.getIssuer()) {
            targetBalance = balance.balance;
          }
        });
      }
      return targetBalance;
    };

    // Should always return at least one item (which is lumens)
    sdkAccount.getSortedBalances = (opts) => {
      if (!opts) {
        opts = {};
      }
      let nativeBalances = [];
      let knownBalances = [];
      let unknownBalances = [];
      sdkAccount.balances.forEach(sdkBalance => {
        if (sdkBalance.asset_type === 'native') {
          if (opts.hideNative) {
            return;
          }
          return nativeBalances.push({
            code: 'XLM',
            issuer: null,
            balance: sdkBalance.balance,
            sdkBalance,
          });
        }
        let newBalance = { // Yay shoes :P
          code: sdkBalance.asset_code,
          issuer: sdkBalance.asset_issuer,
          balance: sdkBalance.balance,
        };
        let asset = directory.resolveAssetByAccountId(newBalance.code, newBalance.issuer);
        if (asset.domain === 'unknown') {
          return unknownBalances.push(newBalance);
        }
        return knownBalances.push(newBalance);
      });

      return nativeBalances.concat(knownBalances, unknownBalances);
    };

    let accountEventsClose = Server.accounts().accountId(keypair.publicKey()).stream({
      onmessage: res => {
        let updated = false;
        if (!_.isEqual(sdkAccount.balances, res.balances)) {
          sdkAccount.balances = res.balances;
          updated = true;
        }

        // We shouldn't pull latest sequence number. It'll only go out of sync if user is using the account in two places

        if (updated) {
          onUpdate();
        }
      }
    });

    sdkAccount.decrementSequence = () => {
      sdkAccount._baseAccount.sequence = sdkAccount._baseAccount.sequence.sub(1);
      window.s = sdkAccount._baseAccount.sequence
      sdkAccount.sequence = sdkAccount._baseAccount.sequence.toString();
    }

    sdkAccount.refresh = async () => {
      let newAccount = await Server.loadAccount(keypair.publicKey());
      sdkAccount.applyNewBalances(newAccount.balances);
      sdkAccount.inflation_destination = newAccount.inflation_destination
    };

    sdkAccount.applyNewBalances = (newBalances) => {
      let updated = false;
      if (!_.isEqual(sdkAccount.balances, newBalances)) {
        sdkAccount.balances = newBalances;
        updated = true;
      }

      if (updated) {
        onUpdate();
      }
    };


    sdkAccount.explainReserve = () => {
      let items = [];
      let sumentries = 0;

      let entriesTrustlines = sdkAccount.balances.length - 1;
      let entriesOffers = Object.keys(sdkAccount.offers).length;
      let entriesOthers = sdkAccount.subentry_count - entriesTrustlines - entriesOffers;

      items.push({
        entryType: 'Base reserve',
        amount: 1,
        XLM: 1,
      });

      items.push({
        entryType: 'Trustlines',
        amount: entriesTrustlines,
        XLM: entriesTrustlines * 0.5,
      });

      items.push({
        entryType: 'Offers',
        amount: entriesOffers,
        XLM: entriesOffers * 0.5,
      });
      items.push({
        entryType: 'Others',
        amount: entriesOthers,
        XLM: entriesOthers * 0.5,
      });
      items.push({
        entryType: 'Extra',
        amount: '',
        XLM: 0.5,
      });

      let totalLumens = _.sumBy(items, 'XLM');
      return {
        items,
        totalLumens,
      }
    };

    // Will always be less than or equal to the current balance
    sdkAccount.calculatePaddedReserve = () => {
      let networkReserve = (2 + sdkAccount.subentry_count) * 0.5;
      let extra = 1;
      return networkReserve + extra;
    }

    sdkAccount.maxLumenSpend = () => {
      let balance = sdkAccount.getLumenBalance();
      let reserve = sdkAccount.calculatePaddedReserve();
      if (reserve > balance) {
        return 0;
      }
      return new BigNumber(balance).minus(reserve).toFixed(7);
    };


    sdkAccount.offers = {};

    // Horizon offers for account doesn't return us updates. So we will have to manually update it.
    // We won't miss any offers assuming that the user only updates their offers through the client
    // with just one window open at a time
    sdkAccount.updateOffers = () => {
      return Server.offers('accounts', keypair.publicKey())
        .limit(100) // TODO: Keep iterating through next() to show more than 100 offers
        .call()
        .then(res => {
          let newOffers = {};
          _.each(res.records, offer => {
            newOffers[offer.id] = offer;
          });
          sdkAccount.offers = newOffers;
          onUpdate();
          return null;
        });
    }
    sdkAccount.updateOffers();

    sdkAccount.close = () => {
      accountEventsClose();
    };

    sdkAccount.clearKeypair = () => {
      MagicSpoon.overwrite(keypair._secretKey)
      MagicSpoon.overwrite(keypair._secretSeed)
    }

    return sdkAccount;
  },
  Orderbook(Server, baseBuying, counterSelling, onUpdate) {
    // Orderbook is an object that keeps track of the orderbook for you.
    // All the driver needs to do is remember to call the close function

    this.ready = false;
    const initialOrderbook = Server.orderbook(baseBuying, counterSelling).call()
      .then((res) => {
        this.asks = res.asks;
        this.bids = res.bids;
        this.baseBuying = baseBuying;
        this.counterSelling = counterSelling;
        this.ready = true;
        onUpdate();
      });
    let streamingOrderbookClose = Server.orderbook(baseBuying, counterSelling)
      .stream({
        onmessage: res => {
          let updated = false;
          if (!_.isEqual(this.bids, res.bids)) {
            this.bids = res.bids;
            updated = true;
          }
          if (!_.isEqual(this.asks, res.asks)) {
            this.asks = res.asks;
            updated = true;
          }
          if (updated) {
            onUpdate();
          }
        }
      })

    // Simple algorithm to remove outliers without mutating
    // Correctly removes outliers and correctly responds to real trends
    //
    // Sliding window outlier correction algorithm:
    // if (current trade is more than 100% off than BOTH previous) {
    //   return median(last 3 trades inclusive of current)
    // } else {
    //   return previous trade
    // }
    let smoothTrades = (trades) => {
      let result = [];
      for (let i = 2; i < trades.length; i++) {
        let a = Number(trades[i-2][1]);
        let b = Number(trades[i-1][1]);
        let c = Number(trades[i  ][1]);

        let ratioA = c/a;
        let ratioB = c/b;
        let geometricAbsoluteDiffA = ratioA > 1 ? ratioA - 1 : 1/ratioA - 1;
        let geometricAbsoluteDiffB = ratioB > 1 ? ratioB - 1 : 1/ratioB - 1;
        if (geometricAbsoluteDiffA > 0.3 && geometricAbsoluteDiffB > 0.3) {
          result.push([trades[i][0], [a,b,c].sort()[1]]);
        } else {
          result.push(trades[i]);
        }
      }
      return result
    }

    let firstFullFetchFinished = false;
    let fetchManyTrades = async () => {
      let records = [];
      let satisfied = false;
      let first = true;
      let depth = 0;
      const MAX_DEPTH = 20;
      let prevCall;
      let startTime = Date.now();
      let fetchTimeout = 20000; // milliseconds before we stop fetching history

      let result;

      while (!this.closed && !satisfied && depth < MAX_DEPTH && Date.now() - startTime < fetchTimeout) {
        depth += 1;
        let tradeResults;
        if (first) {
          tradeResults = await Server.tradeAggregation(baseBuying, counterSelling, 1514764800, Date.now() + 86400000, 900000).limit(200).order('desc').call()
          // tradeResults = await Server.trades().forAssetPair(baseBuying, counterSelling).limit(200).order('desc').call()
          first = false;
        } else {
          tradeResults = await prevCall();
        }
        prevCall = tradeResults.next;

        if (tradeResults.records.length < 200) {
          satisfied = true;
        }
        Array.prototype.push.apply(records, tradeResults.records);

        // Optimization: use this filter before saving it into the records array
        result = _.filter(
          _.map(records, (trade) => {
            return [new Date(trade.timestamp).getTime(), parseFloat(trade.close)];
            // return [
            //   new Date(trade.timestamp).getTime(),
            //   parseFloat(trade.avg),
            //   parseFloat(trade.open),
            //   parseFloat(trade.high),
            //   parseFloat(trade.low),
            //   parseFloat(trade.close),
            // ];
          }),
          (entry) => {
            // Remote NaN elements that cause gaps in the chart.
            // NaN values happens when the trade bought and sold 0.0000000 of each asset
            return !isNaN(entry[1]);
          }
        );


        // Potential optimization: If we load the horizon results into the array in the correct order
        // then sorting will run at near optimal runtime
        result.sort((a,b) => {
          return a[0]-b[0];
        });
        if (!firstFullFetchFinished) {
          this.trades = smoothTrades(result);
        }
        if (depth > 1) {
          // Only show progressive updates when we already have 2 pages
          // 2 pages = 400 records
          // 400 records * 15 minutes = 100 hours = 4 days.
          onUpdate();
        }
      }
      firstFullFetchFinished = true;
      this.trades = smoothTrades(result);
      onUpdate();

      setTimeout(() => {
        if (!this.closed) {
          fetchManyTrades();
        }
      }, 5*60*1000);
    }

    fetchManyTrades();

    this.close = () => {
      this.closed = true;
      streamingOrderbookClose;
    }
    // TODO: Close
  },

  // opts.baseBuying -- StellarSdk.Asset (example: XLM)
  // opts.counterSelling -- StellarSdk.Asset (example: USD)
  // opts.price -- Exchange ratio selling/buying
  // opts.amount -- Here, it's relative to the base (JS-sdk does: Total amount selling)
  // opts.type -- String of either 'buy' or 'sell' (relative to base currency)
  buildTxCreateOffer(Server, spoonAccount, side, opts) {
    let sdkBuying;
    let sdkSelling;
    let sdkPrice;
    let sdkAmount;

    const bigOptsPrice = new BigNumber(opts.price).toPrecision(15);
    const bigOptsAmount = new BigNumber(opts.amount).toPrecision(15);

    console.log(`Creating *${side}* offer at price ${opts.price}`);
    if (side === 'buy') {
      sdkBuying = opts.baseBuying; // ex: lumens
      sdkSelling = opts.counterSelling; // ex: USD
      sdkPrice = new BigNumber(1).dividedBy(bigOptsPrice);
      sdkAmount = new BigNumber(bigOptsAmount).times(bigOptsPrice).toFixed(7);
    } else if (side === 'sell') {
      sdkBuying = opts.counterSelling; // ex: USD
      sdkSelling = opts.baseBuying; // ex: lumens
      sdkPrice = new BigNumber(bigOptsPrice);
      sdkAmount = new BigNumber(bigOptsAmount).toFixed(7);
    } else {
      throw new Error(`Invalid side ${side}`);
    }

    const operationOpts = {
      buying: sdkBuying,
      selling: sdkSelling,
      amount: String(sdkAmount),
      price: String(sdkPrice),
      offerId: 0, // 0 for new offer
    };
    const transaction = new StellarSdk.TransactionBuilder(spoonAccount)
      .addOperation(StellarSdk.Operation.manageOffer(operationOpts))
      // DONT call .build()

    return transaction;
  },
  async buildTxSendPayment(Server, spoonAccount,  opts) {
    // sendPayment will detect if the account is a new account. If so, then it will
    // be a createAccount operation
    let transaction = new StellarSdk.TransactionBuilder(spoonAccount)
    try {
      let destAccount = await Server.loadAccount(opts.destination);
      transaction = transaction.addOperation(StellarSdk.Operation.payment({
        destination: opts.destination,
        asset: opts.asset,
        amount: opts.amount,
      }));
    } catch(e) {
      if (!opts.asset.isNative()) {
        throw new Error('Destination account does not exist. To create it, you must send a minimum of 1 lumens to create it');
      }
      transaction = transaction.addOperation(StellarSdk.Operation.createAccount({
        destination: opts.destination,
        startingBalance: opts.amount,
      }));
    }

    if (opts.memo) {
      transaction = transaction.addMemo(Stellarify.memo(opts.memo.type, opts.memo.content));
    }

    return transaction;
  },
  buildTxSetInflation(spoonAccount, inflationDest) {
    let transaction = new StellarSdk.TransactionBuilder(spoonAccount)
    transaction = transaction.addOperation(StellarSdk.Operation.setOptions({
      inflationDest: inflationDest,
    }));
    // DONT call .build()

    return transaction;
  },
  buildTxChangeTrust(Server, spoonAccount, opts) {
    let sdkLimit;
    if (typeof opts.limit === 'string' || opts.limit instanceof String) {
      sdkLimit = opts.limit;
    } else if (opts.limit !== undefined) {
      throw new Error('changeTrust opts.limit must be a string');
    }

    const operationOpts = {
      asset: opts.asset,
      limit: sdkLimit,
    };
    return new StellarSdk.TransactionBuilder(spoonAccount)
      .addOperation(StellarSdk.Operation.changeTrust(operationOpts))
      // DONT call .build()
  },
  buildTxRemoveOffer(Server, spoonAccount, offerId) {
    return new StellarSdk.TransactionBuilder(spoonAccount)
      .addOperation(StellarSdk.Operation.manageOffer({
        buying: StellarSdk.Asset.native(),
        selling: new StellarSdk.Asset('REMOVE', spoonAccount.accountId()),
        amount: '0',
        price: '1',
        offerId,
      }))
      // DONT call .build()
  },
  async History(Server, publicKey, onUpdate) {
    let history = {
      records: [],
      details: {},
    };

    // TODO: Support new transactions
    const initialWalk = async (results) => {
      let newResults;
      if (results === null) {
        newResults = await Server.effects().forAccount(publicKey).limit(200).order('desc').call();
      } else {
        newResults = await results.next();
      }

      if (newResults.records.length !== 0) {
        history.records = history.records.concat(newResults.records);
        onUpdate();
        initialWalk(newResults);
      }
    };

    initialWalk(null);

    // We continuous walk through records to try to fetch details with a cooldown of 0 seconds.
    // If there is nothing new, then we try again in 5 seconds.
    const detailWalk = async () => {
      let fetchTarget = null;
      for (let i = 0; i < history.records.length; i++) {
        let record = history.records[i];
        if (fetchTarget == null && history.details[record.id] === undefined) {
          fetchTarget = i;
        }
      }

      if (fetchTarget === null) {
        setTimeout(detailWalk, 1000);
      } else {
        let record = history.records[fetchTarget];

        const operation = await record.operation();
        const transaction = await operation.transaction();
        record.category = record.type;
        history.details[record.id] = Object.assign(operation, transaction, record);
        onUpdate();
        detailWalk();
      }
    }
    detailWalk();


    return history;
  },
  overwrite(buffer) {
    if (buffer === undefined) {
      // When logging in with Ledger, secret key is not stored
      return;
    }
    // Overwrite a buffer with random numbers
    // In JavaScript, nothing is guaranteed, but at least it's worth a try
    // This probably doesn't do anything that helpful
    for (let iteration = 0; iteration < 10; iteration++) {
      for (let i = 0; i < buffer.length; i++) {
        buffer[i] = Math.round(Math.random()*255);
      }
    }
  },
};


export default MagicSpoon;
