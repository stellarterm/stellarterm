// The driver maintains the state of the application and drives everything.
// (Well, it knows about everything except for routing)
// Most everything else is just stateless
// This is similar to Redux except more flexible for faster development
import Printify from '../lib/Printify';
import Byol from './Byol';
import _ from 'lodash';
import Stellarify from '../lib/Stellarify';
import Validate from '../lib/Validate';
import BigNumber from 'bignumber.js';
import directory from '../directory';
BigNumber.config({ EXPONENTIAL_AT: 100 });

// Spoonfed Stellar-SDK: Super easy to use higher level Stellar-Sdk functions
// Simplifies the objects to what is necessary. Listens to updates automagically.
// It's in the same file as the driver because the driver is the only one that
// should ever use the spoon.
const MagicSpoon = {
  async Account(Server, keypair, onUpdate) {
    let sdkAccount = await Server.loadAccount(keypair.accountId())
    sdkAccount.sign = transaction => {
      transaction.sign(keypair);
    };

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
    }

    let accountEventsClose = Server.accounts().accountId(keypair.accountId()).stream({
      onmessage: res => {
        let updated = false;
        if (!_.isEqual(sdkAccount.balances, res.balances)) {
          sdkAccount.balances = res.balances;
          updated = true;
        }

        if (updated) {
          onUpdate();
        }
      }
    });

    sdkAccount.offers = {};

    // Horizon offers for account doesn't return us updates. So we will have to manually update it.
    // We won't miss any offers assuming that the user only updates their offers through the client
    // with just one window open at a time
    sdkAccount.updateOffers = () => {
      return Server.offers('accounts', keypair.accountId())
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

    let fetchManyTrades = async () => {
      let records = [];
      let satisfied = false;
      let first = true;
      let depth = 0;
      const MAX_DEPTH = 5;
      let prevCall;

      while (!satisfied && depth < MAX_DEPTH) {
        depth += 1;
        let tradeResults;
        if (first) {
          tradeResults = await Server.orderbook(baseBuying, counterSelling).trades().limit(200).order('desc').call()
          first = false;
        } else {
          tradeResults = await prevCall();
        }
        prevCall = tradeResults.next;

        if (tradeResults.records.length < 200) {
          satisfied = true;
        }
        Array.prototype.push.apply(records, tradeResults.records);
      }
      // Optimization: use this filter before saving it into the records array
      this.trades = _.filter(
        _.map(records, (trade, index) => {
          return [new Date(trade.created_at).getTime(), new BigNumber(trade.bought_amount).dividedBy(trade.sold_amount).toNumber()];
        }),
        (entry) => {
          // Remote NaN elements that cause gaps in the chart.
          // NaN values happens when the trade bought and sold 0.0000000 of each asset
          return !isNaN(entry[1]);
        }
      );

      // Potential optimization: If we load the horizon results into the array in the correct order
      // then sorting will run at near optimal runtime

      // First sort it in reverse so that we can filter
      this.trades.sort((a,b) => {
        return b[0]-a[0];
      });

      // Iterate on trades from new to old
      // Remove trades that are greater than OUTLIER_THRESHOLD times the previous value
      const OUTLIER_THRESHOLD = 2;
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

      onUpdate();
    }

    fetchManyTrades();


    this.close = streamingOrderbookClose;
    // TODO: Close
  },

  // opts.baseBuying -- StellarSdk.Asset (example: XLM)
  // opts.counterSelling -- StellarSdk.Asset (example: USD)
  // opts.price -- Exchange ratio selling/buying
  // opts.amount -- Here, it's relative to the base (JS-sdk does: Total amount selling)
  // opts.type -- String of either 'buy' or 'sell' (relative to base currency)
  createOffer(Server, spoonAccount, side, opts) {
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
      .build();
    spoonAccount.sign(transaction);
    return Server.submitTransaction(transaction)
      .then(res => {
        console.log('Offer create success');
        console.log(res)
        spoonAccount.updateOffers(); // Just to be doubly sure
        return;
      })
  },
  async sendPayment(Server, spoonAccount,  opts) {
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
        throw new Error('Destination account does not exist. To create it, you must send a minimum of 20 lumens to create it');
      }
      transaction = transaction.addOperation(StellarSdk.Operation.createAccount({
        destination: opts.destination,
        startingBalance: opts.amount,
      }));
    }

    if (opts.memo) {
      transaction = transaction.addMemo(Stellarify.memo(opts.memo.type, opts.memo.content));
    }

    transaction = transaction.build();
    spoonAccount.sign(transaction);

    const transactionResult = await Server.submitTransaction(transaction);
    return transactionResult;
  },
  changeTrust(Server, spoonAccount, opts) {
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

    const transaction = new StellarSdk.TransactionBuilder(spoonAccount)
      .addOperation(StellarSdk.Operation.changeTrust(operationOpts))
      .build();
    spoonAccount.sign(transaction);
    const transactionResult = Server.submitTransaction(transaction);
    return transactionResult;
  },
  async removeOffer(Server, spoonAccount, offerId) {
    const transaction = new StellarSdk.TransactionBuilder(spoonAccount)
      .addOperation(StellarSdk.Operation.manageOffer({
        buying: StellarSdk.Asset.native(),
        selling: new StellarSdk.Asset('REMOVE', spoonAccount.accountId()),
        amount: '0',
        price: '1',
        offerId,
      }))
      .build();
    spoonAccount.sign(transaction);
    const transactionResult = await Server.submitTransaction(transaction);
    spoonAccount.updateOffers();
    return transactionResult;
  },
};



// Using old school "classes" because I'm old school and it's simpler to
// understand. I may use the ES6 form later though.
function Driver(opts) {
  this.Server = new StellarSdk.Server(opts.horizonUrl); // Should never change
  this.Server.serverUrl = opts.horizonUrl;

  const byol = new Byol();

  const availableEvents = [
    'session',
    'orderbook',
    'orderbookPricePick',
    'send',
  ];
  const trigger = {};
  availableEvents.forEach((eventName) => {
    this[`listen${eventName.charAt(0).toUpperCase()}${eventName.slice(1)}`] = cb => byol.listen(eventName, cb);
    this[`unlisten${eventName.charAt(0).toUpperCase()}${eventName.slice(1)}`] = id => byol.unlisten(eventName, id);
    trigger[eventName] = (opts) => byol.trigger(eventName, opts);
  });

  // ----- Initializations above this line -----
  // Only the driver should change the session.
  this.session = {
    state: 'out',
    setupError: false, // Couldn't find account
    account: null, // MagicSpoon.Account instance
  };
  // this.session = {
  //   state: 'in',
  //   setupError: false, // Couldn't find account
  //   account: {
  //   }, // MagicSpoon.Account instance
  // };
  // Due to a bug in horizon where it doesn't update offers for accounts, we have to manually check
  // It shouldn't cause too much of an overhead
  let forceUpdateAccountOffers = () => {
    let updateFn = _.get(this.session, 'account.updateOffers');
    if (updateFn) {
      updateFn();
    }
  }

  this.send = {
    init: () => {
      this.send.state = 'setup'; // 'setup' | 'pending' | 'error' | 'success'
      this.send.memoRequired = false;
      this.send.memoType = 'none'; // 'none' | 'MEMO_ID' |'MEMO_TEXT' | 'MEMO_HASH' | 'MEMO_RETURN'
      this.send.memoContent = '';
      this.send.targetAccount = null;
      this.send.step = 1; // Starts at 1. Natural indexing corresponds to the step numbers
    },

    // Constraint: Each step is allowed to safely assume that the previous steps are finished

    // Step state is initialized by the reset functions
    resetStep1: () => {
      this.send.accountId = ''; // After step 1, this will be valid
      this.send.address = ''; // After step 1, this may or may not be filled in
      this.send.step1 = {
        destInput: '', // For storing the raw input field
      }
    },

    step2: {},
    resetStep2: () => {
      this.send.availableAssets = {};
      this.send.availableAssets[Stellarify.assetToSlug(new StellarSdk.Asset.native())] = new StellarSdk.Asset.native();
      this.send.step2 = {
        asset: null,
      };
    },
    calculateAvailableAssets: () => {
      // Calculate the assets that you can send to the destination
      this.send.availableAssets = {};
      this.send.availableAssets[Stellarify.assetToSlug(new StellarSdk.Asset.native())] = new StellarSdk.Asset.native();
      let senderTrusts = {};

      _.each(this.session.account.balances, balance => {
        let asset = Stellarify.asset(balance);
        let slug = Stellarify.assetToSlug(asset);
        if (asset.isNative()) {
          return;
        }
        if (asset.issuer === this.send.targetAccount.accountId()) {
          // Edgecase: Receiver is the issuer of the asset
          // Note: Accounts cant extend trust to themselves, so no further edgecases on this situation
          this.send.availableAssets[slug] = asset;
        } else {
          senderTrusts[slug] = true;
        }
      })

      _.each(this.send.targetAccount.balances, balance => {
        let asset = Stellarify.asset(balance);
        let slug = Stellarify.assetToSlug(asset);
        if (senderTrusts.hasOwnProperty(slug)) {
          this.send.availableAssets[slug] = asset;
        } else if (asset.getIssuer() === this.session.account.accountId()) {
          // Edgecase: Sender is the issuer of the asset
          this.send.availableAssets[slug] = asset;
        }
      })
    },

    step3: {},
    resetStep3: () => {
      this.send.step3 = {
        amount: '',
      };
    },

    loadTargetAccountDetails: () => {
      if (Validate.publicKey(this.send.accountId).ready) {
        this.Server.loadAccount(this.send.accountId)
        .then((account) => {
          if (account.id === this.send.accountId) {
            // Prevent race conditions using this check
            this.send.targetAccount = account;
            this.send.calculateAvailableAssets();
            trigger.send();
          }
        })
        .catch(() => {})
      }
    },

    accountId: '',
    handlers: {
      updateDestination: (e) => {
        this.send.step1.destInput = e.target.value;

        // Reset the defaults
        this.send.accountId = '';
        this.send.address = '';
        this.send.memoRequired = false;
        this.send.memoContentLocked = false;
        this.send.addressNotFound = false;

        // Check for memo requirements in the destination
        if (directory.destinations.hasOwnProperty(this.send.accountId)) {
          let destination = directory.destinations[this.send.accountId];
          if (destination.requiredMemoType) {
            this.send.memoRequired = true;
            this.send.memoType = destination.requiredMemoType;
          }
        }

        // Prevent race race conditions
        let destInput = this.send.step1.destInput;

        if (Validate.address(this.send.step1.destInput).ready) {
          StellarSdk.FederationServer.resolve(this.send.step1.destInput)
          .then((federationRecord) => {
            if (destInput !== this.send.step1.destInput) {
              return;
            }
            this.send.address = this.send.step1.destInput;
            if (!Validate.publicKey(federationRecord['account_id']).ready) {
              throw new Error('Invalid account_id from federation response');
            }
            this.send.accountId = federationRecord['account_id'];

            if (federationRecord['memo_type']) {
              switch (federationRecord['memo_type']) {
                case 'id':
                  this.send.memoType = 'MEMO_ID';
                  break;
                case 'text':
                  this.send.memoType = 'MEMO_TEXT';
                  break;
                case 'hash':
                  this.send.memoType = 'MEMO_HASH';
                  break;
                case 'return':
                  this.send.memoType = 'MEMO_RETURN';
                  break;
                default:
                  throw new Error('Invalid memo_type from federation response');
              }

              this.send.memoRequired = true;
            }

            if (federationRecord['memo']) {
              this.send.memoContent = federationRecord['memo'];
              this.send.memoContentLocked = true;
            }

            trigger.send();
            this.send.loadTargetAccountDetails();
          })
          .catch(e => {
            if (destInput !== this.send.step1.destInput) {
              return;
            }

            console.error(e);
            this.send.addressNotFound = true;
            trigger.send();
          })
        } else if (Validate.publicKey(this.send.step1.destInput).ready) {
          this.send.accountId = this.send.step1.destInput;
          // Async loading of target account
          this.send.loadTargetAccountDetails();
        }

        trigger.send();
      },
      updateMemoType: (e) => {
        this.send.memoType = e.target.value;
        trigger.send();
      },
      updateMemoContent: (e) => {
        this.send.memoContent = e.target.value;
        trigger.send();
      },
      step1Edit: () => {
        this.send.step = 1;
        this.send.resetStep2();
        this.send.resetStep3();
        trigger.send();
      },
      step1Next: () => {
        this.send.step = 2;
        trigger.send();
      },

      step2Edit: () => {
        this.send.step = 2;
        this.send.resetStep3();
        trigger.send();
      },
      step2PickAsset: (slug) => {
        // Step 2 doesn't have a next button because this acts as the next button
        this.send.step2.asset = this.send.availableAssets[slug];
        this.send.step = 3;
        trigger.send();
      },

      step3Edit: () => {
        this.send.step = 3;
        trigger.send();
      },
      updateAmount: (e) => {
        this.send.step3.amount = e.target.value;
        trigger.send();
      },
      step3Next: () => {
        this.send.step = 4;
        trigger.send();
      },
      submit: async () => {
        this.send.state = 'pending';
        trigger.send();
        let result;
        try {
          let sendMemo = (this.send.memoType === 'none') ? undefined : {
            type: this.send.memoType,
            content: this.send.memoContent,
          };
          result = await MagicSpoon.sendPayment(this.Server, this.session.account, {
            destination: this.send.accountId,
            asset: this.send.step2.asset,
            amount: this.send.step3.amount,
            memo: sendMemo,
          });
          this.send.txId = result.hash;
          this.send.state = 'success';
        } catch(err) {
          this.send.state = 'error';
          if (err instanceof Error) {
            this.send.errorDetails = err.message;
          } else {
            this.send.errorDetails = JSON.stringify(err, null, 2);
          }
        }
        trigger.send();
      },
      reset: () => {
        this.send.resetAll();
        trigger.send();
      }
    },

    resetAll: () => {
      this.send.init();
      this.send.resetStep1();
      this.send.resetStep2();
      this.send.resetStep3();
    },
  };

  this.send.resetAll();


  // TODO: Possible (rare) race condition since ready: false can mean either: 1. no pair picked, 2. Loading orderbook from horizon
  this.orderbook = {
    ready: false,
  };

  this.handlers = {
    logIn: async (secretKey) => {
      let keypair;
      try {
        keypair = StellarSdk.Keypair.fromSeed(secretKey);
      } catch (e) {
        console.log('Invalid secret key');
        return;
      }
      this.session.setupError = false;
      this.session.state = 'loading';
      trigger.session();

      try {
        this.session.account = await MagicSpoon.Account(this.Server, keypair, () => {
          trigger.session();
        });
        this.session.state = 'in';
        trigger.session();
      } catch (e) {
        this.session.state = 'out';
        this.session.setupError = true;
        trigger.session();
      }
    },
    createOffer: async (side, opts) => {
      return MagicSpoon.createOffer(this.Server, this.session.account, side, _.assign(opts, {
        baseBuying: this.orderbook.baseBuying,
        counterSelling: this.orderbook.counterSelling,
      }));
    },
    addTrust: async (code, issuer) => {
      // For simplicity, currently only adds max trust line
      return MagicSpoon.changeTrust(this.Server, this.session.account, {
        asset: new StellarSdk.Asset(code, issuer),
      })
    },
    removeTrust: async (code, issuer) => {
      return await MagicSpoon.changeTrust(this.Server, this.session.account, {
        asset: new StellarSdk.Asset(code, issuer),
        limit: '0',
      })
    },
    removeOffer: async (offerId) => {
      return MagicSpoon.removeOffer(this.Server, this.session.account, offerId);
    },
    orderbookPricePick: (price) => {
      trigger.orderbookPricePick({
        price,
      })
    },
    setOrderbook: (baseBuying, counterSelling) => {
      // If orderbook is already set, then this is a no-op
      // Expects baseBuying and counterSelling to StellarSdk.Asset objects
      if (this.orderbook.ready && this.orderbook.baseBuying.equals(baseBuying) && this.orderbook.counterSelling.equals(counterSelling)) {
        return;
      }

      if (this.orderbook.close) {
        this.orderbook.close();
      }
      this.orderbook = new MagicSpoon.Orderbook(this.Server, baseBuying, counterSelling, () => {
        trigger.orderbook();
        forceUpdateAccountOffers();
      });
    }
  };
}


export default Driver;
