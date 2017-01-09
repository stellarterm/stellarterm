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
  this._counterSelling = new StellarSdk.Asset('USD', 'GBAMBOOZDWZPVV52RCLJQYMQNXOBLOXWNQAY2IF2FREV2WL46DBCH3BE');

  // Internal session is a privately scoped variable so that only functions defined here can access it
  let session = {
    // 3 states for session state: 'out', 'loading', 'in'
    state: 'out',
    account: null,
    keypair: null,
  };

  // Only the driver should change the session. This data is derived from the internal session
  this.syncSession = () => {
    this.session = {
      state: session.state,
      accountId: session.state === 'in' ? session.keypair.accountId() : '',
    }
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
