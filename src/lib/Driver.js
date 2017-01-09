// The driver maintains the state of the application and drives everything.
// Most everything else is just stateless
// This is similar to Redux except more flexible for faster development
import Printify from '../lib/Printify';
import Byol from './Byol';

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

  let byol = new Byol();

  let availableEvents = [
    'session',
  ];
  let trigger = {};
  availableEvents.forEach((event) => {
    this['listen' + event.charAt(0).toUpperCase() + event.slice(1)] = (cb) => byol.listen('session', cb);
    this['unlisten' + event.charAt(0).toUpperCase() + event.slice(1)] = (id) => byol.unlisten('session', id);
    trigger[event] = () => byol.trigger('session');
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
