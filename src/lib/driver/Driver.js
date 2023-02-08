import '@babel/polyfill';
import BigNumber from 'bignumber.js';
import Ticker from '../api/Ticker';
import Send from './driverInstances/Send';
import AccountEvents from './driverInstances/AccountEvents';
import Session from './driverInstances/Session';
import Orderbook from './driverInstances/Orderbook';
import Modal from './driverInstances/Modal';
import ToastService from './driverInstances/ToastService';
import HorizonServer from './driverInstances/HorizonServer';
import ClaimableBalances from './driverInstances/ClaimableBalances';
import Effects from './driverInstances/Effects';
import Payments from './driverInstances/Payments';
import WalletConnectService from './driverInstances/WalletConnectService';
import Multisig from './driverInstances/Multisig';
import Swap from './driverInstances/Swap';
import Trades from './driverInstances/Trades';

BigNumber.config({ EXPONENTIAL_AT: 100 });

function Driver() {
    this.isOnline = true;

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
    this.multisig = new Multisig(this);
    this.swap = new Swap(this);
    this.trades = new Trades(this);

    window.view = accountId => {
        this.session.handlers.logInWithPublicKey(accountId);
    };
}

export default Driver;
