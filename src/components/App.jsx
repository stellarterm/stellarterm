import url from 'url';
import React from 'react';
import ReactDOM from 'react-dom';
import * as StellarSdk from 'stellar-sdk';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import isElectron from 'is-electron';
import Driver from '../lib/Driver';
import { isIE, isEdge } from '../lib/BrowserSupport';
import GlobalModal from './GlobalModal/GlobalModal';
import PopupAlert from './PopupAlert/PopupAlert';
import NotFound from './NotFound/NotFound';
import Markets from './Markets/Markets';
import Download from './Download/Download';
import Exchange from './Exchange/Exchange';
import HomePage from './HomePage/HomePage';
import TermsOfUse from './TermsOfUse/TermsOfUse';
import PrivacyPolicy from './PrivacyPolicy/PrivacyPolicy';
import TestNetwork from './TestNetwork/TestNetwork';
import ReloadToTestnet from './ReloadToTestnet/ReloadToTestnet';
import Session from './Session/Session';
import Header from './Header/Header';
import Footer from './Footer/Footer';
import BuyCrypto from './BuyCrypto/BuyCrypto';
import ErrorBoundary from './Common/ErrorBoundary/ErrorBoundary';
import faviconHandler from '../lib/faviconUtils';
import AppLoading from './AppLoading/AppLoading';

window.React = React;
const mountNode = document.getElementById('app');

const DEFAULT_HORIZON_SERVER = 'https://horizon.stellar.org';
// const DEFAULT_HORIZON_SERVER = 'https://horizon.stellar.lobstr.co';

const network = {
    horizonUrl: DEFAULT_HORIZON_SERVER,
    networkPassphrase: StellarSdk.Networks.PUBLIC,
    isDefault: true, // If it's default, then we don't show a notice bar at the top
    isTestnet: false,
    isCustom: false,
};

const TESTNET_URL = '/testnet';

if (!window.location.pathname.includes('index.html') && window.location.hash.indexOf('#') === 0) {
    window.location.replace(
        window.location.pathname +
        (window.location.pathname[window.location.pathname.length - 1] === '/' ? '' : '/') +
        window.location.hash.substr(1));
}

if (window.location.pathname.includes(TESTNET_URL)) {
    network.isDefault = false;
    network.isTestnet = true;
    network.horizonUrl = 'https://horizon-testnet.stellar.org';
    network.networkPassphrase = StellarSdk.Networks.TESTNET;

    const reg = new RegExp(`(.+)${TESTNET_URL}$`);
    window.history.replaceState({}, '', window.location.pathname.replace(reg, '$1'));
} else if (window.stCustomConfig.horizonUrl) {
    network.isDefault = false;
    network.isCustom = true;
    network.horizonUrl = window.stCustomConfig.horizonUrl;
    if (window.stCustomConfig.networkPassphrase) {
        network.networkPassphrase = window.stCustomConfig.networkPassphrase;
    }
}

const driver = new Driver({
    network,
});

const parseUrl = href => {
    const hash = url.parse(href).hash;
    return hash === null ? '' : hash.substr(1);
};

class TermApp extends React.Component {
    constructor(props) {
        super(props);
        this.d = props.d;

        this.isTickerLoaded = false;
        this.unsubscribeTicker = this.d.ticker.event.sub(() => {
            if (!this.state.isTickerLoaded) {
                this.setState({
                    isTickerLoaded: true,
                });
            }
        });

        this.state = {
            // The url is the hash cleaned up
            url: parseUrl(window.location.pathname),
            isTickerLoaded: false,
        };

        window.addEventListener(
            'hashchange',
            e => {
                if (e.newURL.includes('testnet')) {
                    window.location.reload();
                }
                this.setState({ url: parseUrl(e.newURL) });
            },
            false,
        );

        // Alert for logged user before reload page
        if (!isElectron()) {
            window.onbeforeunload = e => {
                const { state } = this.props.d.session;
                if (state === 'in' || state === 'unfunded') {
                    e.returnValue = 'You will be logged out after reload!';
                }
            };
        }

        this.unsub = this.props.d.session.event.sub(() => {
            const { state, unfundedAccountId, account } = this.props.d.session;
            faviconHandler(state, unfundedAccountId, account);
        });
    }

    render() {
        const { d } = this.props;
        const { isTickerLoaded } = this.state;

        if ((isIE() || isEdge()) && localStorage.getItem('hide-browser-popup') !== 'true') {
            this.props.d.modal.handlers.activate('BrowserModal');
        }

        return (
            <BrowserRouter>
                <div>
                    {window.location.pathname.includes('index.html')
                        && (window.location.hash ?
                            <Redirect to={`/?tx=${encodeURIComponent(window.location.hash.substr(1))}`} /> :
                            <Redirect to="/" />)}
                </div>

                <ErrorBoundary>
                    <div className="AppStretch">
                        <GlobalModal d={d} />
                        <div className="AppStretch AppContainer">
                            <div>
                                <Header d={d} network={network} />
                                {isTickerLoaded ? (
                                    <Switch>
                                        <Route
                                            exact
                                            path="/"
                                            render={props => <HomePage {...props} driver={d} />}
                                        />
                                        <Route path="/download/" component={Download} />
                                        <Route
                                            path="/testnet/"
                                            component={network.isTestnet ? TestNetwork : ReloadToTestnet}
                                        />
                                        <Route path="/privacy/" component={PrivacyPolicy} />
                                        <Route path="/terms-of-use/" component={TermsOfUse} />
                                        <Route
                                            path="/account/"
                                            render={props => <Session {...props} d={d} urlParts={'account'} />}
                                        />
                                        <Route
                                            path="/ledger/"
                                            render={props => <Session {...props} d={d} urlParts={'ledger'} />}
                                        />
                                        <Route
                                            path="/trezor/"
                                            render={props => <Session {...props} d={this.props.d} urlParts={'trezor'} />}
                                        />
                                        <Route
                                            path="/freighter/"
                                            render={props => <Session {...props} d={this.props.d} urlParts={'freighter'} />}
                                        />
                                        <Route
                                            path="/signup/"
                                            render={props => <Session {...props} d={d} urlParts={'signup'} />}
                                        />
                                        <Route
                                            path="/markets"
                                            render={props => <Markets {...props} d={d} />}
                                        />
                                        <Route
                                            path="/exchange"
                                            render={props => <Exchange {...props} d={d} />}
                                        />

                                        <Route
                                            path="/buy-crypto"
                                            render={props => <BuyCrypto {...props} d={d} />}
                                        />

                                        <Route component={NotFound} />
                                    </Switch>) :
                                    <AppLoading text="Loading assets and balances" />
                                }
                                <PopupAlert d={d} />
                            </div>
                            <Footer />
                        </div>
                    </div>
                </ErrorBoundary>
            </BrowserRouter>
        );
    }
}

TermApp.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};

ReactDOM.render(<TermApp d={driver} />, mountNode);
