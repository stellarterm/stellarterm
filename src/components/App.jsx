import url from 'url';
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import isElectron from 'is-electron';
import Driver from '../lib/Driver';
import { isIE, isEdge } from '../lib/BrowserSupport';
import faviconHandler from '../lib/faviconUtils';
import GlobalModal from './GlobalModal/GlobalModal';
import ToastTemplate from './ToastTemplate/ToastTemplate';
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
import AppLoading from './AppLoading/AppLoading';

window.React = React;
const mountNode = document.getElementById('app');

if (!window.location.pathname.includes('index.html') && window.location.hash.indexOf('#') === 0) {
    window.location.replace(
        window.location.pathname +
        (window.location.pathname[window.location.pathname.length - 1] === '/' ? '' : '/') +
        window.location.hash.substr(1));
}

const driver = new Driver();

const parseUrl = href => {
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
            isTickerLoaded: false,
            id: 1,
        };

        this.unsubscribeSession = this.props.d.session.event.sub(() => {
            const { state, unfundedAccountId, account } = this.props.d.session;
            faviconHandler(state, unfundedAccountId, account);
        });

        this.unsubscribeTicker = this.d.ticker.event.sub(() => {
            if (!this.state.isTickerLoaded) {
                this.setState({
                    isTickerLoaded: true,
                });
            }
        });

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

        window.addEventListener('online', () => {
            this.setState({ id: this.state.id + 1 }, () => {
                this.d.toastService.clearToasts();
                this.d.toastService.success('Connection restored', 'Internet connection has been restored');
            });
        });

        window.addEventListener('offline', () => {
            this.d.toastService.error('No connection', 'Internet connection appears to be offline');
        });

        // Alert for logged user before reload page
        if (!isElectron()) {
            window.onbeforeunload = e => {
                const { state } = this.props.d.session;
                if (state === 'in' || state === 'unfunded') {
                    e.returnValue = 'You will be logged out after reload!';
                }
            };
        }
    }

    componentWillUnmount() {
        this.unsubscribeSession();
        this.unsubscribeTicker();
    }

    render() {
        const { d } = this.props;
        const { isTickerLoaded, id } = this.state;

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
                    <div className="AppStretch" key={id}>
                        <GlobalModal d={d} />
                        <div className="AppStretch AppContainer">
                            <div>
                                <Header d={d} />
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
                                            component={d.Server.isTestnet ? TestNetwork : ReloadToTestnet}
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
                                <ToastTemplate d={d} />
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
