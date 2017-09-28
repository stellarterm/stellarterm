// The driver maintains the state of the application and drives everything.
// (Well, it knows about everything except for routing)
// Most everything else is just stateless
// This is similar to Redux except more flexible for faster development
import Printify from '../lib/Printify';
import Byol from './Byol';
import _ from 'lodash';
import Stellarify from '../lib/Stellarify';
import MagicSpoon from '../lib/MagicSpoon';
import Validate from '../lib/Validate';
import BigNumber from 'bignumber.js';
BigNumber.config({ EXPONENTIAL_AT: 100 });
import req from './req.js';
import directory from '../directory';

import Ticker from './driver/Ticker.js';
import Send from './driver/Send.js';



// Using old school "classes" because I'm old school and it's simpler to
// understand. I may use the ES6 form later though.
function Driver(opts) {
  this.Server = new StellarSdk.Server(opts.horizonUrl); // Should never change
  this.Server.serverUrl = opts.horizonUrl;

  const byol = new Byol();

  // DEPRECATED: Follow the examples in the driver folder for future features
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
    setupError: false, // Couldn't find account
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

  this.send = new Send(this);
  this.ticker = new Ticker();

  // TODO: Possible (rare) race condition since ready: false can mean either: 1. no pair picked, 2. Loading orderbook from horizon
  this.orderbook = {
    ready: false,
  };

  this.handlers = {
    logIn: async (secretKey) => {
      let keypair;
      try {
        keypair = StellarSdk.Keypair.fromSecret(secretKey);
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
