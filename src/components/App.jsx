import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
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

StellarSdk.Network.use(new StellarSdk.Network(network.networkPassphrase));

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
        return (
            <BrowserRouter>
                <div className="AppStretch">
                    <GlobalModal d={this.props.d} />
                    <div className="AppStretch AppContainer">
                        <div>
                            <Header d={this.props.d} network={network} />
                            <Switch>
                                <Route
                                    exact
                                    path="/"
                                    render={props => <HomePage {...props} driver={this.props.d} />} />
                                <Route path="/download/" component={Download} />
                                <Route path="/testnet/" component={network.isTestnet ? TestNetwork : ReloadToTestnet} />
                                <Route path="/privacy/" component={PrivacyPolicy} />
                                <Route path="/terms-of-use/" component={TermsOfUse} />
                                <Route
                                    path="/account/"
                                    render={props => <Session {...props} d={this.props.d} urlParts={'account'} />} />
                                <Route
                                    path="/ledger/"
                                    render={props => <Session {...props} d={this.props.d} urlParts={'ledger'} />} />
                                <Route
                                    path="/signup/"
                                    render={props => <Session {...props} d={this.props.d} urlParts={'signup'} />} />
                                <Route path="/markets" render={props => <Markets {...props} d={this.props.d} />} />
                                <Route path="/exchange" render={props => <Exchange {...props} d={this.props.d} />} />

                                <Route component={NotFound} />
                            </Switch>
                            <PopupAlert d={this.props.d}/>
                        </div>
                        <Footer />
                    </div>
                </div>
            </BrowserRouter>
        );
    }
}

TermApp.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};

ReactDOM.render(<TermApp d={driver} />, mountNode);
