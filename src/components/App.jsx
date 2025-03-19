import url from 'url';
import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import { Mediator } from '@stellar-broker/client';
import PropTypes from 'prop-types';
import isElectron from 'is-electron';
import Driver from '../lib/driver/Driver';
import { isIE, isEdge } from '../lib/helpers/BrowserSupport';
import faviconHandler from '../lib/helpers/faviconUtils';
import { SESSION_EVENTS, SESSION_STATE } from '../lib/constants/sessionConstants';
import GlobalModal from './GlobalModal/GlobalModal';
import ToastTemplate from './ToastTemplate/ToastTemplate';
import Header from './Header/Header';
import Footer from './Footer/Footer';

import ErrorBoundary from './Common/ErrorBoundary/ErrorBoundary';
import AppLoading from './AppLoading/AppLoading';

import './App.scss';


const ExchangePage = lazy(() => import('./Exchange/Exchange'));
const HomePage = lazy(() => import('./HomePage/HomePage'));
const DownloadPage = lazy(() => import('./Download/Download'));
const TermsOfUsePage = lazy(() => import('./TermsOfUse/TermsOfUse'));
const NotFoundPage = lazy(() => import('./NotFound/NotFound'));
const SwapPage = lazy(() => import('./Swap/Swap'));
const OnRampPage = lazy(() => import('./OnRamp/OnRamp'));
const SessionPage = lazy(() => import('./Session/Session'));
const MarketsPage = lazy(() => import('./Markets/Markets'));
const PrivacyPolicyPage = lazy(() => import('./PrivacyPolicy/PrivacyPolicy'));
const TestNetworkPage = lazy(() => import('./TestNetwork/TestNetwork'));
const ReloadToTestnetPage = lazy(() => import('./ReloadToTestnet/ReloadToTestnet'));
const MediatorDisposePage = lazy(() => import('./MediatorDispose/MediatorDispose'));


window.React = React;
const mountNode = document.getElementById('app');

if (!window.location.pathname.includes('index.html') && window.location.hash.indexOf('#') === 0) {
    window.location.replace(
        window.location.pathname +
            (window.location.pathname[window.location.pathname.length - 1] === '/' ? '' : '/') +
            window.location.hash.substr(1),
    );
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

        this.unsubscribeSession = this.props.d.session.event.sub((eventName, session) => {
            if (eventName === SESSION_EVENTS.LOGIN_EVENT || eventName === SESSION_EVENTS.LOGOUT_EVENT) {
                const { state, unfundedAccountId, account } = session;
                faviconHandler(state, unfundedAccountId, account);

                if (state !== SESSION_STATE.IN) {
                    return;
                }

                if (Mediator.hasObsoleteMediators(account.accountId())) {
                    this.props.d.modal.handlers.cancel();
                    this.props.d.modal.handlers.activate('DisposeMediator');
                }
            }
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
            this.d.isOnline = true;
            this.d.walletConnectService.restoreConnectionIfNeeded();
            this.setState({ id: this.state.id + 1 }, () => {
                this.d.toastService.clearToasts();
                this.d.toastService.success('Connection restored', 'Internet connection has been restored');
            });

            if (this.props.d.session.state === SESSION_STATE.IN &&
                Mediator.hasObsoleteMediators(this.props.d.session.account.accountId())
            ) {
                this.props.d.modal.handlers.cancel();
                this.props.d.modal.handlers.activate('DisposeMediator');
            }
        });

        window.addEventListener('offline', () => {
            this.d.isOnline = false;
            this.d.walletConnectService.clearClient();
            this.d.toastService.error('No connection', 'Internet connection appears to be offline');
        });

        // Alert for logged user before reload page
        if (!isElectron()) {
            window.onbeforeunload = e => {
                const { state } = this.props.d.session;
                if (state === SESSION_STATE.IN || state === SESSION_STATE.UNFUNDED) {
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
                    {window.location.pathname.includes('index.html') &&
                        (window.location.hash ? (
                            <Redirect to={`/?tx=${encodeURIComponent(window.location.hash.substr(1))}`} />
                        ) : (
                            <Redirect to="/" />
                        ))}
                </div>

                <ErrorBoundary>
                    <div className="AppStretch" key={id}>
                        <GlobalModal d={d} />
                        <div className="AppStretch AppContainer">
                            <div>
                                <Header d={d} />
                                {isTickerLoaded ? (
                                    <Suspense fallback={<AppLoading text="Loading..." />}>
                                        <Switch>
                                            <Route exact path="/" render={props => <HomePage {...props} driver={d} />} />
                                            <Route path="/download/" component={DownloadPage} />
                                            <Route
                                                path="/testnet/"
                                                component={d.Server.isTestnet ? TestNetworkPage : ReloadToTestnetPage}
                                            />
                                            <Route path="/privacy/" component={PrivacyPolicyPage} />
                                            <Route path="/terms-of-use/" component={TermsOfUsePage} />
                                            <Route
                                                path="/account/"
                                                render={props => <SessionPage {...props} d={d} urlParts={'account'} />}
                                            />
                                            <Route
                                                path="/ledger/"
                                                render={props => <SessionPage {...props} d={d} urlParts={'ledger'} />}
                                            />
                                            <Route
                                                path="/trezor/"
                                                render={props => (
                                                    <SessionPage {...props} d={this.props.d} urlParts={'trezor'} />
                                                )}
                                            />
                                            <Route
                                                path="/freighter/"
                                                render={props => (
                                                    <SessionPage {...props} d={this.props.d} urlParts={'freighter'} />
                                                )}
                                            />
                                            <Route
                                                path="/wallet-connect/"
                                                render={props => (
                                                    <SessionPage {...props} d={this.props.d} urlParts={'wallet-connect'} />
                                                )}
                                            />
                                            <Route
                                                path="/lobstr/"
                                                render={props => (
                                                    <SessionPage {...props} d={this.props.d} urlParts={'lobstr'} />
                                                )}
                                            />
                                            <Route
                                                path="/mediator/"
                                                render={props => (
                                                    <MediatorDisposePage d={this.props.d} />
                                                )}
                                            />
                                            <Route
                                                path="/signup/"
                                                render={props => <SessionPage {...props} d={d} urlParts={'signup'} />}
                                            />
                                            <Route path="/markets" render={props => <MarketsPage {...props} d={d} />} />
                                            <Route path="/exchange" render={props => <ExchangePage {...props} d={d} />} />

                                            <Route path="/buy-crypto" render={props => <OnRampPage {...props} />} />
                                            <Route path="/swap" render={props => <SwapPage {...props} d={d} />} />

                                            <Route component={NotFoundPage} />
                                        </Switch>
                                    </Suspense>
                                ) : (
                                    <AppLoading text="Loading assets and balances" />
                                )}
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
