// The driver maintains the state of the application and drives everything.
// Most everything else is just stateless
// This is similar to Redux except more flexible for faster development
import Printify from '../lib/Printify';
import Byol from './Byol';


// Spoonfed Stellar-SDK: Super easy to use higher level Stellar-Sdk functions
// Simplifies the objects to what is necessary. Listens to updates automagically.
// It's in the same file as the driver because the driver is the only one that
// should ever use the spoon.
const MagicSpoon = {
  Account(Server, keypair, onLoad, onUpdate) {
    this.ready = false;
    this.accountId = keypair.accountId();
    const initialAccount = Server.loadAccount(this.accountId)
    .then((res) => {
      this.sequence = res.sequence;
      this.balances = res.balances;
      this.ready = true;
      onLoad();
    });
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
    // TODO: Stream updates
    // TODO: Close
  },
};


// Using old school "classes" because I'm old scohol and it's simpler for
// someone experienced in JavaScript to understand. I may use the ES6 form
// later though.
function Driver(opts) {
  this.Server = new StellarSdk.Server(opts.horizonUrl); // Should never change
  this._baseBuying = new StellarSdk.Asset('XLM', null);
  this._counterSelling = new StellarSdk.Asset('USD', 'GDZI4YC2ZYPVWIU54FGOZ62QF563XBSJSPBABW64XKP2DGVIR3YI3M23');

  const byol = new Byol();

  const availableEvents = [
    'session',
    'orderbook',
  ];
  const trigger = {};
  availableEvents.forEach((eventName) => {
    this[`listen${eventName.charAt(0).toUpperCase()}${eventName.slice(1)}`] = cb => byol.listen(eventName, cb);
    this[`unlisten${eventName.charAt(0).toUpperCase()}${eventName.slice(1)}`] = id => byol.unlisten(eventName, id);
    trigger[eventName] = () => byol.trigger(eventName);
  });

  // ----- Initializations above this line -----

  const session = {
    // 3 states for session state: 'out', 'loading', 'in'
    state: 'out',
    account: null,
    keypair: null,
  };

  // Only the driver should change the session. This data is derived from the internal session
  const syncSession = () => {
    this.session = {
      state: session.state,
      account: session.account,
    };
    trigger.session();
  };
  syncSession();

  this.orderbook = new MagicSpoon.Orderbook(this.Server, this._baseBuying, this._counterSelling, () => {
    trigger.orderbook();
  });
  // this.getOrderbook = () => this.Server.orderbook(this._baseBuying, this._counterSelling).call();


  this.baseBuyingAssetName = () => Printify.assetName(this._baseBuying);
  this.counterSellingAssetName = () => Printify.assetName(this._counterSelling);
  this.baseBuyingGetIssuer = () => this._baseBuying.getIssuer();
  this.counterSellingGetIssuer = () => this._counterSelling.getIssuer();

  this.handlers = {
    logIn: async (secretKey) => {
      let keypair;
      try {
        keypair = StellarSdk.Keypair.fromSeed(secretKey);
      } catch (e) {
        console.log('Invalid secret key');
        return;
      }
      session.keypair = keypair;
      session.state = 'loading';
      syncSession();
      session.account = new MagicSpoon.Account(this.Server, keypair, () => {
        session.state = 'in';
        syncSession();
      }, () => {
        syncSession();
      });
    },
  };
}


export default Driver;
