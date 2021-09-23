import '@babel/polyfill';
import BigNumber from 'bignumber.js';
import Ticker from './api/Ticker';
import Send from './driver/Send';
import AccountEvents from './driver/AccountEvents';
import Session from './driver/Session';
import Orderbook from './driver/Orderbook';
import Modal from './driver/Modal';
import ToastService from './driver/ToastService';
import HorizonServer from './HorizonServer';
import ClaimableBalances from './driver/ClaimableBalances';
import Effects from './driver/Effects';
import Payments from './driver/Payments';
import WalletConnectService from './driver/WalletConnectService';

BigNumber.config({ EXPONENTIAL_AT: 100 });

function Driver() {
    this.horizonServer = new HorizonServer(this);
    this.ticker = new Ticker();
    this.session = new Session(this);
    this.orderbook = new Orderbook(this);
    this.send = new Send(this);
    this.accountEvents = new AccountEvents(this);
    this.modal = new Modal(this);
    this.toastService = new ToastService(this);
    this.walletConnectService = new WalletConnectService(this);
    this.claimableBalances = new ClaimableBalances(this);
    this.effects = new Effects(this);
    this.payments = new Payments(this);

    window.view = accountId => {
        this.session.handlers.logInWithPublicKey(accountId);
    };
}

export default Driver;
