// The driver maintains the state of the application and drives everything.
// Most everything else is just stateless
// This is similar to Redux except more flexible for faster development
const Printify = require('../lib/Printify');

// Using old school "classes" because I'm old scohol and it's simpler for
// someone experienced in JavaScript to understand. I may use the ES6 forma
// later though.
function Driver(opts) {
  this.Server = new StellarSdk.Server(opts.horizonUrl);
  this._baseBuying = new StellarSdk.Asset('XLM', null);
  this._counterSelling = new StellarSdk.Asset('USD', 'GBAMBOOZDWZPVV52RCLJQYMQNXOBLOXWNQAY2IF2FREV2WL46DBCH3BE');

  this.getOrderbook = () => this.Server.orderbook(this._baseBuying, this._counterSelling).call();

  this.baseBuyingAssetName = () => Printify.assetName(this._baseBuying);
  this.counterSellingAssetName = () => Printify.assetName(this._counterSelling);
  this.baseBuyingGetIssuer = () => this._baseBuying.getIssuer();
  this.counterSellingGetIssuer = () => this._counterSelling.getIssuer();
}

export default Driver;
