// The driver maintains the state of the application and drives everything.
// Most everything else is just stateless
// This is similar to Redux except more flexible for faster development
import Printify from '../lib/Printify';
// import Spoon from './Spoon';

// Using old school "classes" because I'm old scohol and it's simpler for
// someone experienced in JavaScript to understand. I may use the ES6 forma
// later though.
function Driver(opts) {
  this.Server = new StellarSdk.Server(opts.horizonUrl);
  this._baseBuying = new StellarSdk.Asset('XLM', null);
  this._counterSelling = new StellarSdk.Asset('USD', 'GBAUUA74H4XOQYRSOW2RZUA4QL5PB37U3JS5NE3RTB2ELJVMIF5RLMAG');

  // Internal session is a privately scoped variable so that only functions defined here can access it
  let session = {
    // 3 states for session state: 'out', 'loading', 'in'
    state: 'out',
    account: null,
    keypair: null,
  };


  let _byol = {}; // Build your own listener
  // returns a event id reference that can be used to unlisten
  let _listen = (eventName, cb) => {
    if (!_byol[eventName]) {
      _byol[eventName] = {
        nextIndex: 0,
        listeners: [], // stores callbacks
      }
    }
    let listenerIndex = _byol[eventName].nextIndex;
    _byol[eventName].nextIndex += 1;
    _byol[eventName].listeners[listenerIndex] = cb;
    return listenerIndex;
  }
  let _unlisten = (eventName, id) => {
    if (!isFinite(id)) {
      throw new Error('Invalid unlisten id');
    }
    _byol[eventName] = null;
  }
  // Organized way to trigger things (single source of truth)
  // Using trigger directly is not allowed
  let _trigger = (eventName) => {
    console.log('_byol',_byol)
    if (!_byol[eventName]) {
      return;
    }
    for (let i = 0; i < _byol[eventName].nextIndex; i++) {
      let listener = _byol[eventName].listeners[i];
      if (listener) {
        listener();
      }
    }
  };
  let availableEvents = [
    'session',
  ];
  let trigger = {};
  availableEvents.forEach((event) => {
    this['listen' + event.charAt(0).toUpperCase() + event.slice(1)] = (cb) => _listen('session', cb);
    this['unlisten' + event.charAt(0).toUpperCase() + event.slice(1)] = (id) => _unlisten('session', id);
    trigger[event] = () => _trigger('session');
  })

  // Only the driver should change the session. This data is derived from the internal session
  this.syncSession = () => {
    this.session = {
      state: session.state,
      accountId: session.state === 'in' ? session.keypair.accountId() : '',
    }
    trigger.session();
  }
  this.syncSession();

  this.getOrderbook = () => this.Server.orderbook(this._baseBuying, this._counterSelling).call();

  this.baseBuyingAssetName = () => Printify.assetName(this._baseBuying);
  this.counterSellingAssetName = () => Printify.assetName(this._counterSelling);
  this.baseBuyingGetIssuer = () => this._baseBuying.getIssuer();
  this.counterSellingGetIssuer = () => this._counterSelling.getIssuer();

  this.handlers = {
    logIn: async (secretKey) => {
      let seedValidity = true;
      let keypair;
      try {
        keypair = StellarSdk.Keypair.fromSeed(secretKey);
      } catch (e) {
        seedValidity = false;
        console.log('Invalid secret key');
        return;
      }
      session.keypair = keypair;
      session.state = 'loading';
      this.syncSession();
      session.account = await this.Server.loadAccount(keypair.accountId());
      session.state = 'in';
      this.syncSession();
    }
  }

}

// Spoonfed Stellar-SDK: Super easy to use higher level Stellar-Sdk functions
// It's in the same file as the driver because the driver is the only one that should ever use the spoon
class Spoon {
}


export default Driver;
