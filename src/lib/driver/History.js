import _ from 'lodash';

import MagicSpoon from '../MagicSpoon';
import Event from '../Event';

export default function History(driver) {
  this.event = new Event();

  let active = false;
  this.spoonHistory = null;

  // The way this history thing is that once the user touches the history tab,
  // they have permanently initiated history loading mode (and this is when
  // we start to eat through all the horizon history).

  // It's simple and reliable. this.handlers.touch is idempotent so it's fine
  // if it gets called many times

  this.handlers = {
    touch: (e) => {
      if (active == false) {
        active = true;
        setTimeout(async () => {
          this.spoonHistory = await MagicSpoon.History(driver.Server, driver.session.account.account_id, () => {
            this.event.trigger();
          });
        }, 10);
      }
    },
  };
}

