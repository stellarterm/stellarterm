import _ from 'lodash';

import MagicSpoon from '../MagicSpoon';
import Stellarify from '../Stellarify';
import directory from '../../directory';
import Validate from '../Validate';
import Event from '../Event';

export default function Send(driver) {
  this.event = new Event();

  const init = () => {
    this.data = {
      ready: false,
    };
  };
  init();


  this.handlers = {
    createOffer: async (side, opts) => MagicSpoon.createOffer(driver.Server, driver.session.account, side, _.assign(opts, {
      baseBuying: this.data.baseBuying,
      counterSelling: this.data.counterSelling,
    })),
    // addTrust: async (code, issuer) =>
    //   // For simplicity, currently only adds max trust line
    //    MagicSpoon.changeTrust(driver.Server, driver.session.account, {
    //      asset: new StellarSdk.Asset(code, issuer),
    //    }),
    // removeTrust: async (code, issuer) => await MagicSpoon.changeTrust(driver.Server, driver.session.account, {
    //   asset: new StellarSdk.Asset(code, issuer),
    //   limit: '0',
    // }),
    // removeOffer: async offerId => MagicSpoon.removeOffer(driver.Server, driver.session.account, offerId),
    pickPrice: (price) => {
      this.event.trigger({
        pickPrice: price,
      });
    },
    setOrderbook: (baseBuying, counterSelling) => {
      // If orderbook is already set, then this is a no-op
      // Expects baseBuying and counterSelling to StellarSdk.Asset objects
      if (this.data.ready && this.data.baseBuying.equals(baseBuying) && this.data.counterSelling.equals(counterSelling)) {
        return;
      }

      if (this.data.close) {
        this.data.close();
      }
      this.data = new MagicSpoon.Orderbook(driver.Server, baseBuying, counterSelling, () => {
        trigger.orderbook();
        driver.session.forceUpdateAccountOffers();
      });
    },
  };
}

