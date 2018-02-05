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
  };
}

