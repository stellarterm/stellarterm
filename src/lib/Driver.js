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
  availableEvents.forEach((eventName) => {
    this[`listen${eventName.charAt(0).toUpperCase()}${eventName.slice(1)}`] = cb => byol.listen(eventName, cb);
    this[`unlisten${eventName.charAt(0).toUpperCase()}${eventName.slice(1)}`] = id => byol.unlisten(eventName, id);
    trigger[eventName] = opts => byol.trigger(eventName, opts);
  });

  // ----- Initializations above this line -----
  // Only the driver should change the session.
  this.session = {
    state: 'out',
    setupError: false, // Couldn't find account
    unfundedAccountId: '',
    account: null, // MagicSpoon.Account instance
    filters: {
      trade: true,
      account: true,
      signer: true,
      trustline: true,
    },
    transactionHistory: null,
    fullTransactionHistory: null,
    filteredTxHistory: null,
  };
  // Due to a bug in horizon where it doesn't update offers for accounts, we have to manually check
  // It shouldn't cause too much of an overhead
  const forceUpdateAccountOffers = () => {
    const updateFn = _.get(this.session, 'account.updateOffers');
    if (updateFn) {
      updateFn();
    }
  };

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
        console.log('Invalid secret key! We should never reach here!');
        console.error(e);
        return;
      }
      this.session.setupError = false;
      if (this.session.state !== 'unfunded') {
        this.session.state = 'loading';
        trigger.session();
      }

      try {
        this.session.account = await MagicSpoon.Account(this.Server, keypair, () => {
          trigger.session();
        });
        this.session.fullTransactionHistory = await MagicSpoon.fullHistory(this.Server, this.session.account.account_id);
        this.session.state = 'in';
        trigger.session();
      } catch (e) {
        if (e.data) {
          this.session.state = 'unfunded';
          this.session.unfundedAccountId = keypair.publicKey();
          setTimeout(() => {
            console.log('Checking to see if account has been created yet');
            if (this.session.state === 'unfunded') {
              // Avoid race conditions
              this.handlers.logIn(secretKey);
            }
          }, 2000);
          trigger.session();
          return;
        }
        this.session.state = 'out';
        this.session.setupError = true;
        trigger.session();
      }
    },
    createOffer: async (side, opts) => MagicSpoon.createOffer(this.Server, this.session.account, side, _.assign(opts, {
      baseBuying: this.orderbook.baseBuying,
      counterSelling: this.orderbook.counterSelling,
    })),
    addTrust: async (code, issuer) =>
      // For simplicity, currently only adds max trust line
       MagicSpoon.changeTrust(this.Server, this.session.account, {
         asset: new StellarSdk.Asset(code, issuer),
       }),
    removeTrust: async (code, issuer) => await MagicSpoon.changeTrust(this.Server, this.session.account, {
      asset: new StellarSdk.Asset(code, issuer),
      limit: '0',
    }),
    removeOffer: async offerId => MagicSpoon.removeOffer(this.Server, this.session.account, offerId),
    orderbookPricePick: (price) => {
      trigger.orderbookPricePick({
        price,
      });
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
    },
    loadHistory: async () => {
      this.session.state = 'loading';
      trigger.session();
      this.session.transactionHistory = await MagicSpoon.loadHistory(this.Server, this.session.fullTransactionHistory.records.slice(0, 6));
      this.session.filteredTxHistory = this.session.transactionHistory;
      this.session.state = 'in';
      trigger.session();

      MagicSpoon.loadHistory(this.Server, this.session.fullTransactionHistory.records.slice(6, 201), (data) => {
        this.session.transactionHistory.push(data);
        trigger.session();
      });

      MagicSpoon.refresh(this.Server, this.session.account.account_id, async (res) => {
        const check = !_.includes(this.session.fullTransactionHistory.records.map(x => x.id), res.id)
        if(check) {
          const resp = await res.operation();
          const resp2 = await resp.transaction();
          res.category = res.type;
          let obj = Object.assign(resp, resp2, res)

          // Need better way for this
          this.session.transactionHistory.unshift(obj);
          let filtered = Object.keys(this.session.filters).filter( x => this.session.filters[x]);
          this.session.filteredTxHistory = this.session.transactionHistory.filter( x => filtered.indexOf(x.type.split("_")[0]) !== -1 );
          trigger.session();
        }
      })
    },
    filterHistory: async (e) => {
      this.session.filters[e.target.name] = !this.session.filters[e.target.name];
      let filtered = Object.keys(this.session.filters).filter( x => this.session.filters[x]);
      this.session.filteredTxHistory = this.session.transactionHistory.filter( x => filtered.indexOf(x.type.split("_")[0]) !== -1 );
      trigger.session();
    },
  };
}

export default Driver;
