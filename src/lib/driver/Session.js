import _ from 'lodash';

import BigNumber from 'bignumber.js';
import MagicSpoon from '../MagicSpoon';
import Stellarify from '../Stellarify';
import directory from '../../directory';
import Validate from '../Validate';
import Event from '../Event';
const StellarLedger = window.StellarLedger;

let DEVELOPMENT_TO_PROMPT = true;

export default function Send(driver) {
  this.event = new Event();

  const init = () => {
    this.state = 'out'; // 'out', 'unfunded', 'loading', 'in'
    this.setupError = false; // Unable to contact network

    this.setupLedgerError = null; // Could connect but couldn't reach address
    this.ledgerConnected = false;

    this.unfundedAccountId = '';
    this.inflationDone = false;
    this.account = null; // MagicSpoon.Account instance
    this.authType = ''; // '', 'secret', 'ledger', 'pubkey'
  };
  init();

  // TODO: This kludge was added a year ago. It might be fixed
  // Due to a bug in horizon where it doesn't update offers for accounts, we have to manually check
  // It shouldn't cause too much of an overhead
  this.forceUpdateAccountOffers = () => {
    const updateFn = _.get(this, 'account.updateOffers');
    if (updateFn) {
      updateFn();
    }
  };


  // Ping the Ledger device to see if it is connected
  this.pingLedger = (loop = false) => {
    // console.log('Ledger wallet ping. Connection: ' + this.ledgerConnected)
    new StellarLedger.Api(new StellarLedger.comm(4)).connect(success => {
      if (this.ledgerConnected === false) {
        this.ledgerConnected = true;
        this.event.trigger();
      }
      // console.log('Ledger wallet pong. Connection: ' + this.ledgerConnected)
      // setTimeout(() => {this.pingLedger(true)}, 15000);
    }, error => {
      if (this.ledgerConnected === true) {
        this.ledgerConnected = false;
        this.event.trigger();
      }
      setTimeout(() => {this.pingLedger(true)}, 1000);
    })
  }
  this.pingLedger(true);

  this.handlers = {
    logInWithSecret: async (secretKey) => {
      let keypair = StellarSdk.Keypair.fromSecret(secretKey);
      return this.handlers.logIn(keypair, {
        authType: 'secret',
      });
    },
    logInWithPublicKey: async (accountId) => {
      let keypair = StellarSdk.Keypair.fromPublicKey(accountId);
      return this.handlers.logIn(keypair, {
        authType: 'pubkey',
      });
    },
    logInWithLedger: async (bip32Path) => {
      try {
        let connectionResult = await new StellarLedger.Api(new StellarLedger.comm(4)).getPublicKey_async(bip32Path)
        this.setupLedgerError = null;
        let keypair = StellarSdk.Keypair.fromPublicKey(connectionResult.publicKey);
        return this.handlers.logIn(keypair, {
          authType: 'ledger',
          bip32Path,
        });
      } catch (error) {
        this.setupLedgerError = error.message;
        if (error && error.errorCode) {
          let u2fErrorCodes = {
              0: 'OK',
              1: 'OTHER_ERROR',
              2: 'BAD_REQUEST',
              3: 'CONFIGURATION_UNSUPPORTED',
              4: 'DEVICE_INELIGIBLE',
              5: 'TIMEOUT (unable to communicate with device)',
          };
          this.setupLedgerError = u2fErrorCodes[error.errorCode];
        }
        this.event.trigger();
      }
    },
    logIn: async (keypair, opts) => {
      this.setupError = false;
      if (this.state !== 'unfunded') {
        this.state = 'loading';
        this.event.trigger();
      }

      try {
        this.account = await MagicSpoon.Account(driver.Server, keypair, opts, () => {
          this.event.trigger();
        });
        this.state = 'in';
        this.authType = opts.authType;

        let inflationDoneDestinations = {
          'GDCHDRSDOBRMSUDKRE2C4U4KDLNEATJPIHHR2ORFL5BSD56G4DQXL4VW': true,
          'GCCD6AJOYZCUAQLX32ZJF2MKFFAUJ53PVCFQI3RHWKL3V47QYE2BNAUT': true,
        };

        if (inflationDoneDestinations[this.account.inflation_destination]) {
          this.inflationDone = true;
        }
        this.event.trigger();
      } catch (e) {
        if (e.data) {
          this.state = 'unfunded';
          this.unfundedAccountId = keypair.publicKey();
          setTimeout(() => {
            console.log('Checking to see if account has been created yet');
            if (this.state === 'unfunded') {
              // Avoid race conditions
              this.handlers.logIn(keypair, opts);
            }
          }, 2000);
          this.event.trigger();
          return;
        }
        console.log(e);
        this.state = 'out';
        this.setupError = true;
        this.event.trigger();
      }
    },

    // Using buildSignSubmit is the preferred way to go. It handles sequence numbers correctly.
    // If you use sign, you have to pay attention to sequence numbers because js-stellar-sdk's .build() updates it magically
    // The reason this doesn't take in a TransactionBuilder so we can call build() here is that there
    // are cases when we want to paste in a raw transaction and sign that
    sign: async (tx) => {
      if (this.account.inflation_destination === 'GDCHDRSDOBRMSUDKRE2C4U4KDLNEATJPIHHR2ORFL5BSD56G4DQXL4VW') {
        console.log('Signing tx\nhash:', tx.hash().toString('hex'),'\nsequence: ' + tx.sequence, '\n\n' + tx.toEnvelope().toXDR('base64'))
        console.log('https://www.stellar.org/laboratory/#txsigner?xdr=' + encodeURIComponent(tx.toEnvelope().toXDR('base64')) + '&network=public');
      }
      if (this.authType === 'secret') {
        this.account.signWithSecret(tx);
        console.log('Signed tx\nhash:', tx.hash().toString('hex'),'\n\n' + tx.toEnvelope().toXDR('base64'))
        return {
          status: 'finish',
          signedTx: tx
        };
      } else if (this.authType === 'ledger') {
        return driver.modal.handlers.activate('signWithLedger', tx)
          .then(async (modalResult) => {
            if (modalResult.status === 'finish') {
              console.log('Signed tx with ledger\nhash:', modalResult.output.hash().toString('hex'),'\n\n' + modalResult.output.toEnvelope().toXDR('base64'))
              return {
                status: 'finish',
                signedTx: modalResult.output
              };
            }
            return modalResult
          })
      } else {
        return driver.modal.handlers.activate('sign', tx)
        .then(async (modalResult) => {
          if (modalResult.status === 'finish') {
            await this.account.sign(tx);
            console.log('Signed tx\nhash:', tx.hash().toString('hex'),'\n\n' + tx.toEnvelope().toXDR('base64'))
            return {
              status: 'finish',
              signedTx: tx
            };
          }
          return modalResult
        })
      }
    },
    buildSignSubmit: async (txBuilder) => {
      // Returns: bssResult which contains status and (if finish) serverResult
      // Either returns a cancel or finish with the transaction-in-flight Promise
      // (finish only means modal finished; It does NOT mean the transaction succeeded)

      // This will also undo the sequence number that stellar-sdk magically adds
      let result = {
        status: 'cancel',
      }

      let tx = txBuilder.build();
      try {
        let signResult = await this.handlers.sign(tx);
        if (signResult.status === 'finish') {
          console.log('Submitting tx\nhash:', tx.hash().toString('hex'))
          let serverResult = driver.Server.submitTransaction(tx).then((transactionResult) => {
            console.log('Confirmed tx\nhash:', tx.hash().toString('hex'))
            this.account.refresh();
            return transactionResult;
          })
          .catch(error => {
            console.log('Failed tx\nhash:', tx.hash().toString('hex'))
            throw error;
          })

          result = {
            status: 'finish',
            serverResult: serverResult,
          }
        }
      } catch(e) {
        console.log(e)
      }

      if (result.status !== 'finish') {
        this.account.decrementSequence();
      }

      return result; // bssResult
    },

    setInflation: async (destination) => {
      let txBuilder = MagicSpoon.buildTxSetInflation(this.account, destination);
      return await this.handlers.buildSignSubmit(txBuilder);
    },
    voteContinue: async () => {
      let bssResult = await this.handlers.setInflation('GDCHDRSDOBRMSUDKRE2C4U4KDLNEATJPIHHR2ORFL5BSD56G4DQXL4VW');
      if (bssResult.status === 'finish') {
        this.inflationDone = true;
        this.event.trigger();
      }
    },
    noThanks: () => {
      this.inflationDone = true;
      this.event.trigger();
    },
    addTrust: async (code, issuer) => {
      // We only add max trust line
      // Having a "limit" is a design mistake in Stellar that was carried over from the Ripple codebase
      let tx = MagicSpoon.buildTxChangeTrust(driver.Server, this.account, {
        asset: new StellarSdk.Asset(code, issuer),
      });
      return await this.handlers.buildSignSubmit(tx);
    },
    removeTrust: async (code, issuer) => {
      // Trust lines are removed by setting limit to 0
      let tx = MagicSpoon.buildTxChangeTrust(driver.Server, this.account, {
        asset: new StellarSdk.Asset(code, issuer),
        limit: '0',
      });
      return await this.handlers.buildSignSubmit(tx);
    },
    createOffer: async (side, opts) => {
      let tx = MagicSpoon.buildTxCreateOffer(driver.Server, this.account, side, _.assign(opts, {
        baseBuying: driver.orderbook.data.baseBuying,
        counterSelling: driver.orderbook.data.counterSelling,
      }));
      let bssResult = await this.handlers.buildSignSubmit(tx);
      if (bssResult.status === 'finish') {
        bssResult.serverResult.then(res => {
          this.account.updateOffers();
          return res;
        })
      }
      return bssResult;
    },
    removeOffer: async (offerId) => {
      let tx = MagicSpoon.buildTxRemoveOffer(driver.Server, this.account, offerId);
      let bssResult = await this.handlers.buildSignSubmit(tx);
      if (bssResult.status === 'finish') {
        bssResult.serverResult.then(res => {
          this.account.updateOffers();
          return res;
        })
      }
      return bssResult;
    },
    logout: () => {
      try {
        this.account.clearKeypair();
        delete this.account;
        init();
        window.location.reload();
      } catch(e) {
        window.location.reload();
      }
    },
  };
}

