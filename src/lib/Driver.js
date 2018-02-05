// The driver maintains the state of the application and drives everything.
// (Well, it knows about everything except for routing)
// Most everything else is just stateless
// This is similar to Redux except more flexible for faster development
import _ from 'lodash';
import BigNumber from 'bignumber.js';
import Byol from './Byol';
import MagicSpoon from '../lib/MagicSpoon';
import Ticker from './driver/Ticker';
import Send from './driver/Send';
import History from './driver/History';
import Session from './driver/Session';
import Orderbook from './driver/Orderbook';

BigNumber.config({ EXPONENTIAL_AT: 100 });

function Driver(driverOpts) {
  this.Server = new StellarSdk.Server(driverOpts.network.horizonUrl);
  this.Server.serverUrl = driverOpts.network.horizonUrl;

  const byol = new Byol();

  // DEPRECATED: Follow the examples in the driver folder for future features
  const availableEvents = [
    'session',
    'orderbook',
    'orderbookPricePick',
  ];
  const trigger = {};
  window.trigger = trigger;
  availableEvents.forEach((eventName) => {
    this[`listen${eventName.charAt(0).toUpperCase()}${eventName.slice(1)}`] = cb => byol.listen(eventName, cb);
    this[`unlisten${eventName.charAt(0).toUpperCase()}${eventName.slice(1)}`] = id => byol.unlisten(eventName, id);
    trigger[eventName] = opts => byol.trigger(eventName, opts);
  });

  this.session = new Session(this);
  this.orderbook = new Orderbook(this);
  this.send = new Send(this);
  this.history = new History(this);
  this.ticker = new Ticker();

  window.driver = this;
  window.view = (accountId) => {
    this.session.handlers.logIn('',{publicKey:accountId})
  }

  this.handlers = {
    // createOffer: async (side, opts) => MagicSpoon.createOffer(this.Server, this.session.account, side, _.assign(opts, {
    //   baseBuying: this.orderbook.baseBuying,
    //   counterSelling: this.orderbook.counterSelling,
    // })),
    // addTrust: async (code, issuer) =>
    //   // For simplicity, currently only adds max trust line
    //    MagicSpoon.changeTrust(this.Server, this.session.account, {
    //      asset: new StellarSdk.Asset(code, issuer),
    //    }),
    removeTrust: async (code, issuer) => await MagicSpoon.changeTrust(this.Server, this.session.account, {
      asset: new StellarSdk.Asset(code, issuer),
      limit: '0',
    }),
    removeOffer: async offerId => MagicSpoon.removeOffer(this.Server, this.session.account, offerId),
    // orderbookPricePick: (price) => {
    //   trigger.orderbookPricePick({
    //     price,
    //   });
    // },
    // setOrderbook: (baseBuying, counterSelling) => {
    //   // If orderbook is already set, then this is a no-op
    //   // Expects baseBuying and counterSelling to StellarSdk.Asset objects
    //   if (this.orderbook.ready && this.orderbook.baseBuying.equals(baseBuying) && this.orderbook.counterSelling.equals(counterSelling)) {
    //     return;
    //   }

    //   if (this.orderbook.close) {
    //     this.orderbook.close();
    //   }
    //   this.orderbook = new MagicSpoon.Orderbook(this.Server, baseBuying, counterSelling, () => {
    //     trigger.orderbook();
    //     this.session.forceUpdateAccountOffers();
    //   });
    // },
  };
}

export default Driver;
