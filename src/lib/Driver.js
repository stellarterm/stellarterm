// The driver maintains the state of the application and drives everything.
// (Well, it knows about everything except for routing)
// Most everything else is just stateless
// This is similar to Redux except more flexible for faster development
import Printify from '../lib/Printify';
import Byol from './Byol';
import _ from 'lodash';
import Stellarify from '../lib/Stellarify';
import BigNumber from 'bignumber.js';
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
    Server.submitTransaction(transaction)
      .then(res => {
        console.log('Offer create success');
        console.log(res)
        spoonAccount.updateOffers(); // Just to be doubly sure
        return;
      })
      .catch(err => {
        console.error(err)
      })
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
  },
};


// Using old school "classes" because I'm old scohol and it's simpler for
// someone experienced in JavaScript to understand. I may use the ES6 form
// later though.
function Driver(opts) {
  this.Server = new StellarSdk.Server(opts.horizonUrl); // Should never change
  this.Server.serverUrl = opts.horizonUrl;

  const byol = new Byol();

  const availableEvents = [
    'session',
    'orderbook',
    'orderbookPricePick',
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
    account: null, // MagicSpoon.Account instance
  };
  // Due to a bug in horizon where it doesn't update offers for accounts, we have to manually check
  // It shouldn't cause too much of an overhead
  let forceUpdateAccountOffers = () => {
    let updateFn = _.get(this.session, 'account.updateOffers');
    if (updateFn) {
      updateFn();
    }
  }


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
      this.session.state = 'loading';
      trigger.session();

      this.session.account = await MagicSpoon.Account(this.Server, keypair, () => {
        trigger.session();
      });
      this.session.state = 'in';
      trigger.session();
    },
    createOffer: async (side, opts) => {
      MagicSpoon.createOffer(this.Server, this.session.account, side, _.assign(opts, {
        baseBuying: this.orderbook.baseBuying,
        counterSelling: this.orderbook.counterSelling,
      }));
    },
    addTrust: async (code, issuer) => {
      // For simplicity, currently only adds max trust line
      MagicSpoon.changeTrust(this.Server, this.session.account, {
        asset: new StellarSdk.Asset(code, issuer),
      })
    },
    removeTrust: async (code, issuer) => {
      MagicSpoon.changeTrust(this.Server, this.session.account, {
        asset: new StellarSdk.Asset(code, issuer),
        limit: '0',
      })
    },
    removeOffer: async (offerId) => {
      MagicSpoon.removeOffer(this.Server, this.session.account, offerId);
    },
    orderbookPricePick: (price) => {
      trigger.orderbookPricePick({
        price,
      })
    },
    setOrderbook: (baseBuying, counterSelling) => {
      // If orderbook is already set, then this is a no-op
      // Expects baseBuying and counterSelling to StellarSdk.Asset objects
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
