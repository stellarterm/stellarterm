import React from 'react';
import ReactDOM from 'react-dom';
import url from 'url';
import PropTypes from 'prop-types';
import Stellarify from './lib/Stellarify';
import GlobalModal from './components/GlobalModal';
import NotFound from './components/NotFound';
import PrivacyPolicy from './components/Pages/PrivacyPolicy';
import TestNetwork from './components/Pages/TestNetwork';
import ReloadToTestnet from './components/Pages/ReloadToTestnet';
import Markets from './components/Markets';
import Session from './components/Session';
import Exchange from './components/Exchange';
import Generic from './components/Generic';
import Download from './components/Download';
import Header from './components/Header';
import HomePage from './components/Pages/HomePage';
import Footer from './components/Footer';
import TermsOfUse from './components/TermsOfUse';
import Driver from './lib/Driver';

window.React = React;
const mountNode = document.getElementById('app');

const network = {
    horizonUrl: 'https://horizon.stellar.org',
    networkPassphrase: StellarSdk.Networks.PUBLIC,
    isDefault: true, // If it's default, then we don't show a notice bar at the top
    isTestnet: false,
    isCustom: false,
};

if (window.location.hash === '#testnet') {
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
            url: parseUrl(window.location.href),
        };

        window.addEventListener('hashchange', (e) => {
            if (e.newURL.indexOf('/#testnet') !== -1) {
                window.location.reload();
            }
            this.setState({ url: parseUrl(e.newURL) });
        }, false);
    }

    render() {
        const currentUrl = this.state.url;
        const urlParts = currentUrl.split('/');

        let body;
        if (currentUrl === '') {
            // Home page
            body = <HomePage driver={this.props.d} />;
        } else if (urlParts[0] === 'download') {
            body = <Download />;
        } else if (urlParts[0] === 'testnet' && network.isTestnet) {
            body = <TestNetwork />;
        } else if (urlParts[0] === 'testnet') {
            body = <ReloadToTestnet />;
        } else if (urlParts[0] === 'privacy') {
            body = <PrivacyPolicy />;
        } else if (urlParts[0] === 'terms-of-use') {
            body = <TermsOfUse />;
        } else if (['account', 'signup', 'ledger'].indexOf(urlParts[0]) > -1) {
            body = <Session d={this.d} urlParts={urlParts} />;
        } else if (urlParts[0] === 'markets') {
            body = <Markets d={this.d} />;
        } else if (urlParts[0] === 'exchange' && urlParts.length === 3) {
            try {
                const baseBuying = Stellarify.parseAssetSlug(urlParts[1]);
                const counterSelling = Stellarify.parseAssetSlug(urlParts[2]);

                this.d.orderbook.handlers.setOrderbook(baseBuying, counterSelling);
                body = <Exchange d={this.d} />;
            } catch (e) {
                console.error(e);
                body =
                    (<Generic title="Pick a market">
                        Exchange url was invalid. To begin, go to the <a href="#markets">market
                        list page</a> and pick a trading pair.
                    </Generic>);
            }
        } else if (urlParts[0] === 'exchange' && this.d.orderbook.data.ready) {
            setTimeout(() => {
                const { baseBuying, counterSelling } = this.d.orderbook.data;
                const newUrl = Stellarify.pairToExchangeUrl(baseBuying, counterSelling);
                window.history.replaceState(null, null, `#${newUrl}`);
                this.setState({
                    url: newUrl,
                });
            }, 0);
            body = <Generic title="Loading orderbook">Loading</Generic>;
        } else if (urlParts[0] === 'exchange') {
            // Default to a market with good activity
            const baseBuying = new StellarSdk.Asset('MOBI', 'GA6HCMBLTZS5VYYBCATRBRZ3BZJMAFUDKYYF6AH6MVCMGWMRDNSWJPIH');
            const counterSelling = StellarSdk.Asset.native();

            this.d.orderbook.handlers.setOrderbook(baseBuying, counterSelling);
            setTimeout(() => {
                const newUrl = Stellarify.pairToExchangeUrl(baseBuying, counterSelling);
                window.history.replaceState(null, null, `#${newUrl}`);
                this.setState({
                    url: newUrl,
                });
            }, 0);
        } else {
            body = <NotFound />;
        }

        return (
            <div className="AppStretch">
                <GlobalModal d={this.props.d} />
                <div className="AppStretch AppContainer">
                    <div>
                        <Header d={this.props.d} urlParts={urlParts} network={network} />
                        {body}
                    </div>
                    <Footer />
                </div>
            </div>
        );
    }
}

TermApp.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};

ReactDOM.render(<TermApp d={driver} />, mountNode);
