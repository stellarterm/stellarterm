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

  this.session = new Session(this);
  this.orderbook = new Orderbook(this);
  this.send = new Send(this);
  this.history = new History(this);
  this.ticker = new Ticker();

  window.driver = this;
  window.view = (accountId) => {
    this.session.handlers.logIn('',{publicKey:accountId})
  }
}

export default Driver;
