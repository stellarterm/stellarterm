import _ from 'lodash';

import MagicSpoon from '../MagicSpoon';
import Stellarify from '../Stellarify';
import directory from '../../directory';
import Validate from '../Validate';
import Event from '../Event';

export default function Orderbook(driver) {
  this.event = new Event();

  const init = () => {
    this.data = {
      ready: false,
    };
  };
  init();

  this.handlers = {
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
        this.event.trigger();
        driver.session.forceUpdateAccountOffers();
      });
    },
  };
}

