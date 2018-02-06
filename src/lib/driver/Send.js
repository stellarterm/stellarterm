import _ from 'lodash';

import MagicSpoon from '../MagicSpoon';
import Stellarify from '../Stellarify';
import directory from '../../directory';
import Validate from '../Validate';
import Event from '../Event';

export default function Send(driver) {
  this.event = new Event();

  // Constraint: Each step is allowed to safely assume that the previous steps are finished
  this.step2 = {};
  this.step3 = {};
  this.accountId = '';

  const init = () => {
    this.state = 'setup'; // 'setup' | 'pending' | 'error' | 'success'
    this.memoRequired = false;
    this.memoType = 'none'; // 'none' | 'MEMO_ID' |'MEMO_TEXT' | 'MEMO_HASH' | 'MEMO_RETURN'
    this.memoContent = '';
    this.targetAccount = null;
    this.step = 1; // Starts at 1. Natural indexing corresponds to the step numbers
  };


  // Step state is initialized by the reset functions
  const resetStep1 = () => {
    this.accountId = ''; // After step 1, this will be valid
    this.address = ''; // After step 1, this may or may not be filled in
    this.step1 = {
      destInput: '', // For storing the raw input field
    };
  };

  const resetStep2 = () => {
    this.availableAssets = {};
    this.availableAssets[Stellarify.assetToSlug(new StellarSdk.Asset.native())] = {
      asset: new StellarSdk.Asset.native(),
      sendable: true,
    };
    this.step2 = {
      asset: null,
    };
  };

  const resetStep3 = () => {
    this.step3 = {
      amount: '',
    };
  };

  const resetAll = () => {
    init();
    resetStep1();
    resetStep2();
    resetStep3();
  };

  resetAll();

  const loadTargetAccountDetails = () => {
    if (Validate.publicKey(this.accountId).ready) {
      driver.Server.loadAccount(this.accountId)
      .then((account) => {
        if (account.id === this.accountId) {
          // Prevent race conditions using this check
          this.targetAccount = account;
          calculateAvailableAssets();
          this.event.trigger();
        }
      })
      .catch(() => {});
    }
  };

  const calculateAvailableAssets = () => {
    // Calculate the assets that you can send to the destination
    this.availableAssets = {};
    this.availableAssets[Stellarify.assetToSlug(new StellarSdk.Asset.native())] = {
      asset: new StellarSdk.Asset.native(),
      sendable: true,
    };
    const senderTrusts = {};
    const receiverTrusts = {};

    let sendableAssets = {};
    let unSendableAssets = {};

    _.each(driver.session.account.balances, (balance) => {
      const asset = Stellarify.asset(balance);
      const slug = Stellarify.assetToSlug(asset);
      if (asset.isNative()) {
        return;
      }
      if (asset.issuer === this.targetAccount.accountId()) {
        // Edgecase: Receiver is the issuer of the asset
        // Note: Accounts cant extend trust to themselves, so no further edgecases on this situation
        this.availableAssets[slug] = {
          asset: asset,
          sendable: true
        };
        receiverTrusts[slug] = true;
      } else {
        senderTrusts[slug] = true;
      }
    });

    _.each(this.targetAccount.balances, (balance) => {
      const asset = Stellarify.asset(balance);
      const slug = Stellarify.assetToSlug(asset);
      if (asset.isNative()) {
        return;
      }
      // We don't really care about the usecase of sending to issuer.
      receiverTrusts[slug] = true;
    });

    _.each(this.targetAccount.balances, (balance) => {
      const asset = Stellarify.asset(balance);
      const slug = Stellarify.assetToSlug(asset);
      if (senderTrusts.hasOwnProperty(slug)) {
        sendableAssets[slug] = {
          asset: asset,
          sendable: true,
        };
      } else if (asset.getIssuer() === driver.session.account.accountId()) {
        // Edgecase: Sender is the issuer of the asset
        sendableAssets[slug] = {
          asset: asset,
          sendable: true,
        };
      } else {
        // Asset can't be sent.
      }
    });

    // Show stuff the recipient doesn't trust
    _.each(driver.session.account.balances, balance => {
      const asset = Stellarify.asset(balance);
      const slug = Stellarify.assetToSlug(asset);
      if (asset.isNative()) {
        return;
      }

      if (!sendableAssets.hasOwnProperty(slug) && !receiverTrusts.hasOwnProperty(slug)) {
        unSendableAssets[slug] = {
          asset: asset,
          sendable: false,
          reason: 'receiverNoTrust',
        };
      }
    })

    _.each(sendableAssets, (availability, slug) => {
      this.availableAssets[slug] = availability;
    });
    _.each(unSendableAssets, (availability, slug) => {
      this.availableAssets[slug] = availability;
    });

    if (directory.destinations.hasOwnProperty(this.accountId)) {
      let whitelist = directory.destinations[this.accountId].acceptedAssetsWhitelist;
      if (whitelist) {
        this.availableAssets = _.map(this.availableAssets, (availability, slug) => {
          if (whitelist.indexOf(slug) === -1) {
            availability.sendable = false;
            availability.reason = 'assetNotWhitelisted';
          }
          return availability
        });
      }
    }
  };

  this.handlers = {
    updateDestination: (e) => {
      this.step1.destInput = e.target.value;

      // Reset the defaults
      this.accountId = '';
      this.address = '';
      this.memoRequired = false;
      this.memoContentLocked = false;
      this.addressNotFound = false;

      if (Validate.publicKey(this.step1.destInput).ready) {
        this.accountId = this.step1.destInput;

        // Check for memo requirements in the destination
        if (directory.destinations.hasOwnProperty(this.accountId)) {
          const destination = directory.destinations[this.accountId];
          if (destination.requiredMemoType) {
            this.memoRequired = true;
            this.memoType = destination.requiredMemoType;
          }
        }

        // Async loading of target account
        loadTargetAccountDetails();
      } else if (Validate.address(this.step1.destInput).ready) {
        // Prevent race race conditions
        const destInput = this.step1.destInput;

        StellarSdk.FederationServer.resolve(this.step1.destInput)
        .then((federationRecord) => {
          if (destInput !== this.step1.destInput) {
            return;
          }
          this.address = this.step1.destInput;
          if (!Validate.publicKey(federationRecord.account_id).ready) {
            throw new Error('Invalid account_id from federation response');
          }
          this.accountId = federationRecord.account_id;

          if (federationRecord.memo_type) {
            switch (federationRecord.memo_type) {
              case 'id':
                this.memoType = 'MEMO_ID';
                break;
              case 'text':
                this.memoType = 'MEMO_TEXT';
                break;
              case 'hash':
                this.memoType = 'MEMO_HASH';
                break;
              case 'return':
                this.memoType = 'MEMO_RETURN';
                break;
              default:
                throw new Error('Invalid memo_type from federation response');
            }

            this.memoRequired = true;
          }

          if (federationRecord.memo) {
            this.memoContent = federationRecord.memo;
            this.memoContentLocked = true;
          }

          this.event.trigger();
          loadTargetAccountDetails();
        })
        .catch(err => {
          if (destInput !== this.step1.destInput) {
            return;
          }

          console.error(err);
          this.addressNotFound = true;
          this.event.trigger();
        });
      }

      this.event.trigger();
    },
    updateMemoType: (e) => {
      this.memoType = e.target.value;
      this.event.trigger();
    },
    updateMemoContent: (e) => {
      this.memoContent = e.target.value;
      this.event.trigger();
    },
    step1Edit: () => {
      this.step = 1;
      resetStep2();
      resetStep3();
      this.event.trigger();
    },
    step1Next: () => {
      this.step = 2;
      this.event.trigger();
    },

    step2Edit: () => {
      this.step = 2;
      resetStep3();
      this.event.trigger();
    },
    step2PickAsset: (slug) => {
      // Step 2 doesn't have a next button because this acts as the next button
      this.step2.availability = this.availableAssets[slug];
      this.step = 3;
      this.event.trigger();
    },

    step3Edit: () => {
      this.step = 3;
      this.event.trigger();
    },
    updateAmount: (e) => {
      this.step3.amount = e.target.value;
      this.event.trigger();
    },
    step3Next: () => {
      this.step = 4;
      this.event.trigger();
    },
    submit: async () => {
      try {
        const sendMemo = (this.memoType === 'none') ? undefined : {
          type: this.memoType,
          content: this.memoContent,
        };

        let tx = await MagicSpoon.buildTxSendPayment(driver.Server, driver.session.account, {
          destination: this.accountId,
          asset: this.step2.availability.asset,
          amount: this.step3.amount,
          memo: sendMemo,
        });

        let bssResult = await driver.session.handlers.buildSignSubmit(tx);

        if (bssResult.status === 'finish') {
          this.state = 'pending';
          this.event.trigger();

          let result = await bssResult.serverResult;
          this.txId = result.hash;
          this.state = 'success';
        }
      } catch (err) {
        this.state = 'error';
        if (err instanceof Error) {
          this.errorDetails = err.message;
        } else {
          this.errorDetails = JSON.stringify(err, null, 2);
        }
        this.event.trigger();
      }
    },
    reset: () => {
      resetAll();
      this.event.trigger();
    },
  };
}

