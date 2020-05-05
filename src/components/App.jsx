import React from 'react';
import ReactDOM from 'react-dom';
import * as StellarSdk from 'stellar-sdk';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import url from 'url';
import PropTypes from 'prop-types';
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
import Driver from '../lib/Driver';
import { isIE, isEdge } from '../lib/BrowserSupport';
import ErrorBoundary from './Common/ErrorBoundary/ErrorBoundary';

window.React = React;
const mountNode = document.getElementById('app');

// const DEFAULT_HORIZON_SERVER = 'https://horizon.stellar.org';
const DEFAULT_HORIZON_SERVER = 'https://horizon.stellar.lobstr.co';

const network = {
    horizonUrl: DEFAULT_HORIZON_SERVER,
    networkPassphrase: StellarSdk.Networks.PUBLIC,
    isDefault: true, // If it's default, then we don't show a notice bar at the top
    isTestnet: false,
    isCustom: false,
};

if (window.location.hash.indexOf('#') === 0) {
    window.location.replace(window.location.hash.substr(1));
}

if (window.location.pathname === '/testnet') {
    network.isDefault = false;
    network.isTestnet = true;
    network.horizonUrl = 'https://horizon-testnet.stellar.org';
    network.networkPassphrase = StellarSdk.Networks.TESTNET;
} else if (window.stCustomConfig.horizonUrl) {
    network.isDefault = false;
    network.isCustom = true;
    network.horizonUrl = window.stCustomConfig.horizonUrl;
    if (window.stCustomConfig.networkPassphrase) {
        network.networkPassphrase = window.stCustomConfig.networkPassphrase;
    }
}

window.networkPassphrase = network.networkPassphrase;

const driver = new Driver({
    network,
});

const parseUrl = (href) => {
    const hash = url.parse(href).hash;
    return hash === null ? '' : hash.substr(1);
};

class TermApp extends React.Component {
    constructor(props) {
        super(props);
        this.d = props.d;

        this.state = {
            // The url is the hash cleaned up
            url: parseUrl(window.location.pathname),
        };

        window.addEventListener(
            'hashchange',
            (e) => {
                if (e.newURL.indexOf('/testnet') !== -1) {
                    window.location.reload();
                }
                this.setState({ url: parseUrl(e.newURL) });
            },
            false,
        );
    }

    render() {
        const { d } = this.props;

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
                                <Switch>
                                    <Route
                                        exact
                                        path="/"
                                        render={props => <HomePage {...props} driver={d} />} />
                                    <Route path="/download/" component={Download} />
                                    <Route
                                        path="/testnet/"
                                        component={network.isTestnet ? TestNetwork : ReloadToTestnet} />
                                    <Route path="/privacy/" component={PrivacyPolicy} />
                                    <Route path="/terms-of-use/" component={TermsOfUse} />
                                    <Route
                                        path="/account/"
                                        render={props => <Session {...props} d={d} urlParts={'account'} />} />
                                    <Route
                                        path="/ledger/"
                                        render={props => <Session {...props} d={d} urlParts={'ledger'} />} />
                                    <Route
                                        path="/trezor/"
                                        render={props => <Session {...props} d={this.props.d} urlParts={'trezor'} />} />
                                    <Route
                                        path="/signup/"
                                        render={props => <Session {...props} d={d} urlParts={'signup'} />} />
                                    <Route
                                        path="/markets"
                                        render={props => <Markets {...props} d={d} />} />
                                    <Route
                                        path="/exchange"
                                        render={props => <Exchange {...props} d={d} />} />

                                    <Route component={NotFound} />
                                </Switch>
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
