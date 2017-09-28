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
import req from './req.js';
import directory from '../directory';
BigNumber.config({ EXPONENTIAL_AT: 100 });



// Using old school "classes" because I'm old school and it's simpler to
// understand. I may use the ES6 form later though.
function Driver(opts) {
  this.Server = new StellarSdk.Server(opts.horizonUrl); // Should never change
  this.Server.serverUrl = opts.horizonUrl;

  const byol = new Byol();

  const availableEvents = [
    'session',
    'orderbook',
    'orderbookPricePick',
    'send',
    'ticker',
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
  // this.session = {
  //   state: 'in',
  //   setupError: false, // Couldn't find account
  //   account: {
  //   }, // MagicSpoon.Account instance
  // };
  // Due to a bug in horizon where it doesn't update offers for accounts, we have to manually check
  // It shouldn't cause too much of an overhead
  let forceUpdateAccountOffers = () => {
    let updateFn = _.get(this.session, 'account.updateOffers');
    if (updateFn) {
      updateFn();
    }
  }

  this.send = {
    init: () => {
      this.send.state = 'setup'; // 'setup' | 'pending' | 'error' | 'success'
      this.send.memoRequired = false;
      this.send.memoType = 'none'; // 'none' | 'MEMO_ID' |'MEMO_TEXT' | 'MEMO_HASH' | 'MEMO_RETURN'
      this.send.memoContent = '';
      this.send.targetAccount = null;
      this.send.step = 1; // Starts at 1. Natural indexing corresponds to the step numbers
    },

    // Constraint: Each step is allowed to safely assume that the previous steps are finished

    // Step state is initialized by the reset functions
    resetStep1: () => {
      this.send.accountId = ''; // After step 1, this will be valid
      this.send.address = ''; // After step 1, this may or may not be filled in
      this.send.step1 = {
        destInput: '', // For storing the raw input field
      }
    },

    step2: {},
    resetStep2: () => {
      this.send.availableAssets = {};
      this.send.availableAssets[Stellarify.assetToSlug(new StellarSdk.Asset.native())] = new StellarSdk.Asset.native();
      this.send.step2 = {
        asset: null,
      };
    },
    calculateAvailableAssets: () => {
      // Calculate the assets that you can send to the destination
      this.send.availableAssets = {};
      this.send.availableAssets[Stellarify.assetToSlug(new StellarSdk.Asset.native())] = new StellarSdk.Asset.native();
      let senderTrusts = {};

      _.each(this.session.account.balances, balance => {
        let asset = Stellarify.asset(balance);
        let slug = Stellarify.assetToSlug(asset);
        if (asset.isNative()) {
          return;
        }
        if (asset.issuer === this.send.targetAccount.accountId()) {
          // Edgecase: Receiver is the issuer of the asset
          // Note: Accounts cant extend trust to themselves, so no further edgecases on this situation
          this.send.availableAssets[slug] = asset;
        } else {
          senderTrusts[slug] = true;
        }
      })

      _.each(this.send.targetAccount.balances, balance => {
        let asset = Stellarify.asset(balance);
        let slug = Stellarify.assetToSlug(asset);
        if (senderTrusts.hasOwnProperty(slug)) {
          this.send.availableAssets[slug] = asset;
        } else if (asset.getIssuer() === this.session.account.accountId()) {
          // Edgecase: Sender is the issuer of the asset
          this.send.availableAssets[slug] = asset;
        }
      })
    },

    step3: {},
    resetStep3: () => {
      this.send.step3 = {
        amount: '',
      };
    },

    loadTargetAccountDetails: () => {
      if (Validate.publicKey(this.send.accountId).ready) {
        this.Server.loadAccount(this.send.accountId)
        .then((account) => {
          if (account.id === this.send.accountId) {
            // Prevent race conditions using this check
            this.send.targetAccount = account;
            this.send.calculateAvailableAssets();
            trigger.send();
          }
        })
        .catch(() => {})
      }
    },

    accountId: '',
    handlers: {
      updateDestination: (e) => {
        this.send.step1.destInput = e.target.value;

        // Reset the defaults
        this.send.accountId = '';
        this.send.address = '';
        this.send.memoRequired = false;
        this.send.memoContentLocked = false;
        this.send.addressNotFound = false;

        // Check for memo requirements in the destination
        if (directory.destinations.hasOwnProperty(this.send.accountId)) {
          let destination = directory.destinations[this.send.accountId];
          if (destination.requiredMemoType) {
            this.send.memoRequired = true;
            this.send.memoType = destination.requiredMemoType;
          }
        }

        // Prevent race race conditions
        let destInput = this.send.step1.destInput;

        if (Validate.address(this.send.step1.destInput).ready) {
          StellarSdk.FederationServer.resolve(this.send.step1.destInput)
          .then((federationRecord) => {
            if (destInput !== this.send.step1.destInput) {
              return;
            }
            this.send.address = this.send.step1.destInput;
            if (!Validate.publicKey(federationRecord['account_id']).ready) {
              throw new Error('Invalid account_id from federation response');
            }
            this.send.accountId = federationRecord['account_id'];

            if (federationRecord['memo_type']) {
              switch (federationRecord['memo_type']) {
                case 'id':
                  this.send.memoType = 'MEMO_ID';
                  break;
                case 'text':
                  this.send.memoType = 'MEMO_TEXT';
                  break;
                case 'hash':
                  this.send.memoType = 'MEMO_HASH';
                  break;
                case 'return':
                  this.send.memoType = 'MEMO_RETURN';
                  break;
                default:
                  throw new Error('Invalid memo_type from federation response');
              }

              this.send.memoRequired = true;
            }

            if (federationRecord['memo']) {
              this.send.memoContent = federationRecord['memo'];
              this.send.memoContentLocked = true;
            }

            trigger.send();
            this.send.loadTargetAccountDetails();
          })
          .catch(e => {
            if (destInput !== this.send.step1.destInput) {
              return;
            }

            console.error(e);
            this.send.addressNotFound = true;
            trigger.send();
          })
        } else if (Validate.publicKey(this.send.step1.destInput).ready) {
          this.send.accountId = this.send.step1.destInput;
          // Async loading of target account
          this.send.loadTargetAccountDetails();
        }

        trigger.send();
      },
      updateMemoType: (e) => {
        this.send.memoType = e.target.value;
        trigger.send();
      },
      updateMemoContent: (e) => {
        this.send.memoContent = e.target.value;
        trigger.send();
      },
      step1Edit: () => {
        this.send.step = 1;
        this.send.resetStep2();
        this.send.resetStep3();
        trigger.send();
      },
      step1Next: () => {
        this.send.step = 2;
        trigger.send();
      },

      step2Edit: () => {
        this.send.step = 2;
        this.send.resetStep3();
        trigger.send();
      },
      step2PickAsset: (slug) => {
        // Step 2 doesn't have a next button because this acts as the next button
        this.send.step2.asset = this.send.availableAssets[slug];
        this.send.step = 3;
        trigger.send();
      },

      step3Edit: () => {
        this.send.step = 3;
        trigger.send();
      },
      updateAmount: (e) => {
        this.send.step3.amount = e.target.value;
        trigger.send();
      },
      step3Next: () => {
        this.send.step = 4;
        trigger.send();
      },
      submit: async () => {
        this.send.state = 'pending';
        trigger.send();
        let result;
        try {
          let sendMemo = (this.send.memoType === 'none') ? undefined : {
            type: this.send.memoType,
            content: this.send.memoContent,
          };
          result = await MagicSpoon.sendPayment(this.Server, this.session.account, {
            destination: this.send.accountId,
            asset: this.send.step2.asset,
            amount: this.send.step3.amount,
            memo: sendMemo,
          });
          this.send.txId = result.hash;
          this.send.state = 'success';
        } catch(err) {
          this.send.state = 'error';
          if (err instanceof Error) {
            this.send.errorDetails = err.message;
          } else {
            this.send.errorDetails = JSON.stringify(err, null, 2);
          }
        }
        trigger.send();
      },
      reset: () => {
        this.send.resetAll();
        trigger.send();
      }
    },

    resetAll: () => {
      this.send.init();
      this.send.resetStep1();
      this.send.resetStep2();
      this.send.resetStep3();
    },
  };

  this.send.resetAll();

  // TODO: Load the ticker only when needed. For now, the majority of the uses will load the ticker at some point
  // so it makes sense to load it when the app starts.
  this.ticker = {
    ready: false,
    body: {},
  };

  req.getJson('https://api.stellarterm.com/v1/ticker.json')
  .then(tickerData => {
    this.ticker.ready = true;
    _.assign(this.ticker, tickerData);
    trigger.ticker();
  })
  .catch(e => {
    console.error(e);
    req.getJson('https://api.stellarterm.com/v1/ticker.json')
    .then(tickerData => {
      this.ticker.ready = true;
      _.assign(this.ticker, tickerData);
      trigger.ticker();
    })
    .catch(e => {
      console.error(e);
    })
  })


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
