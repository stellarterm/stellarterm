import _ from 'lodash';

import MagicSpoon from '../MagicSpoon';
import Stellarify from '../Stellarify';
import directory from '../../directory';
import Validate from '../Validate';
import Event from '../Event';

export default function Send(driver) {
  this.event = new Event();

  const init = () => {
    this.state = 'out'; // 'out', 'unfunded', 'loading', 'in'
    this.setupError = false; // Unable to contact network
    this.unfundedAccountId = '';
    this.inflationDone = false;
    this.account = null; // MagicSpoon.Account instance
  };
  init();

  // TODO: This kludge was added a year ago. It might be fixed
  // Due to a bug in horizon where it doesn't update offers for accounts, we have to manually check
  // It shouldn't cause too much of an overhead
  this.forceUpdateAccountOffers = () => {
    const updateFn = _.get(this.session, 'account.updateOffers');
    if (updateFn) {
      updateFn();
    }
  };


  this.handlers = {
    logIn: async (secretKey, opts) => {
      let keypair;
      try {
        if (opts && opts.publicKey !== undefined) {
          keypair = StellarSdk.Keypair.fromPublicKey(opts.publicKey);
        } else {
          keypair = StellarSdk.Keypair.fromSecret(secretKey);
        }
      } catch (e) {
        console.log('Invalid secret key! We should never reach here!');
        console.error(e);
        return;
      }
      this.setupError = false;
      if (this.state !== 'unfunded') {
        this.state = 'loading';
        this.event.trigger();
      }

      try {
        this.account = await MagicSpoon.Account(driver.Server, keypair, () => {
          this.event.trigger();
        });
        this.state = 'in';

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
              this.handlers.logIn(secretKey);
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
  };
}

