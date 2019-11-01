import React from 'react';
import PropTypes from 'prop-types';
import { Switch, Route } from 'react-router-dom';
import ActivityNavMenu from './ActivitityNavMenu/ActivityNavMenu';
import Driver from '../../../../lib/Driver';
import ActivityOpenOrders from './ActivityOpenOrders/ActivityOpenOrders';
import ActivityTradesHistory from './ActivityTradesHistory/ActivityTradesHistory';
import ActivityPaymentsHistory from './ActivityPaymentsHistory/ActivityPaymentsHistory';
import ActivitySignersHistory from './ActivitySignersHistory/ActivitySignersHistory';
import ActivityTrustlinesHistory from './ActivityTrustlinesHistory/ActivityTrustlinesHistory';

export const ROW_HEIGHT = 47;
export const formatDate = (timestamp) => {
    if (timestamp === null) {
        return {
            emptyDate: true,
        };
    }
    const date = new Date(timestamp).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
    const time = new Date(timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });
    return {
        time,
        date,
    };
};

export default class Activity extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [],
            loading: false,
            historyNext: undefined,
            isHistoryFull: false,
            paymentHistory: [],
            paymentsLoading: false,
            paymentHistoryNext: undefined,
            isPaymentHistoryFull: false,
        };
    }

    componentDidUpdate() {
        if (window.location.pathname !== '/account/activity/' && (this.state.history.length === 0)
            && !this.state.loading) {
            this.getHistory();
        }
        if (window.location.pathname === '/account/activity/payments/' && (this.state.paymentHistory.length === 0)
            && !this.state.paymentsLoading) {
            this.getPaymentHistory();
        }
    }

    getHistory() {
        this.setState({ loading: true });
        this.props.d.history.handlers.getOperations(200).then((history) => {
            this.setState({
                history: history.records,
                historyNext: history.next,
                loading: false,
            });
        });
    }

    getPaymentHistory() {
        this.setState({ paymentsLoading: true });
        this.props.d.history.handlers.getPaymentsHistory(200).then((history) => {
            this.setState({
                paymentHistory: history.records,
                paymentHistoryNext: history.next,
                paymentsLoading: false,
            });
        });
    }

    loadMore(next, historyType, loadingType, nextType, isFullType) {
        if (this.state[loadingType] || this.state[isFullType]) {
            return;
        }
        this.setState({ [loadingType]: true });
        next().then((res) => {
            if (res.records.length === 0) {
                this.setState({ [loadingType]: false, [isFullType]: true });
                return;
            }

            this.setState({
                [historyType]: [...this.state[historyType], ...res.records],
                [nextType]: res.next,
                [loadingType]: false,
            });
        });
    }

    render() {
        const { d } = this.props;
        const { history, loading, paymentHistory, paymentsLoading } = this.state;
        const openOffers = Object.values(d.session.account.offers);
        const hasOpenOffers = !!openOffers.length;

        return (
            <div className="island Activity">
                <ActivityNavMenu hasOpenOffers={hasOpenOffers} />
                <Switch>
                    <Route
                        exact
                        path="/account/activity/"
                        render={() => <ActivityOpenOrders openOffers={openOffers} d={d} />} />

                    <Route
                        exact
                        path="/account/activity/trade/"
                        render={() =>
                            <ActivityTradesHistory
                                d={d}
                                loadMore={() => this.loadMore(this.state.historyNext,
                                    'history',
                                    'loading',
                                    'historyNext',
                                    'isHistoryFull')}
                                history={history}
                                loading={loading} />} />

                    <Route
                        exact
                        path="/account/activity/payments/"
                        render={() =>
                            <ActivityPaymentsHistory
                                d={d}
                                loadMore={() => this.loadMore(this.state.paymentHistoryNext,
                                    'paymentHistory',
                                    'paymentsLoading',
                                    'paymentHistoryNext',
                                    'isPaymentHistoryFull')}
                                allHistory={history}
                                history={paymentHistory}
                                loading={paymentsLoading} />} />

                    <Route
                        exact
                        path="/account/activity/signers/"
                        render={() =>
                            <ActivitySignersHistory
                                history={history}
                                loadMore={() => this.loadMore(this.state.historyNext,
                                    'history',
                                    'loading',
                                    'historyNext',
                                    'isHistoryFull')}
                                loading={loading} />} />
                    <Route
                        exact
                        path="/account/activity/trustlines/"
                        render={() =>
                            <ActivityTrustlinesHistory
                                d={d}
                                loadMore={() => this.loadMore(this.state.historyNext,
                                    'history',
                                    'loading',
                                    'historyNext',
                                    'isHistoryFull')}
                                history={history}
                                loading={loading} />} />


                    <Route render={() => <div>The requested page was not found.</div>} />
                </Switch>
            </div>
        );
    }
}
Activity.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
