import 'babel-polyfill';
import BigNumber from 'bignumber.js';
import * as StellarSdk from 'stellar-sdk';

import Ticker from './api/Ticker';
import Send from './driver/Send';
import History from './driver/History';
import Session from './driver/Session';
import Orderbook from './driver/Orderbook';
import Modal from './driver/Modal';

BigNumber.config({ EXPONENTIAL_AT: 100 });

function Driver(driverOpts) {
    this.Server = new StellarSdk.Server(driverOpts.network.horizonUrl);
    this.Server.serverUrl = driverOpts.network.horizonUrl;
    this.Server.networkPassphrase = driverOpts.network.networkPassphrase;

    this.ticker = new Ticker();
    this.session = new Session(this);
    this.orderbook = new Orderbook(this);
    this.send = new Send(this);
    this.history = new History(this);
    this.modal = new Modal(this);

    window.view = (accountId) => {
        this.session.handlers.logInWithPublicKey(accountId);
    };
}

export default Driver;
