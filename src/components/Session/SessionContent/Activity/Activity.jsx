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


export default class Activity extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [],
            loading: false,
            paymentHistory: [],
            paymentsLoading: false,
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
            });
            this.loadMore(history.next, 'history', 'loading');
        });
    }

    getPaymentHistory() {
        this.setState({ paymentsLoading: true });
        this.props.d.history.handlers.getPaymentsHistory(200).then((history) => {
            this.setState({
                paymentHistory: history.records,
            });
            this.loadMore(history.next, 'paymentHistory', 'paymentsLoading');
        });
    }

    loadMore(next, historyType, loadingType) {
        next().then((res) => {
            if (res.records.length === 0) {
                this.setState({ [loadingType]: false });
                return;
            }

            this.setState({
                [historyType]: [...this.state[historyType], ...res.records],
            });
            this.loadMore(res.next, historyType, loadingType);
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
                        render={() => <ActivityTradesHistory d={d} history={history} loading={loading} />} />

                    <Route
                        exact
                        path="/account/activity/payments/"
                        render={() =>
                            <ActivityPaymentsHistory
                                d={d}
                                allHistory={history}
                                history={paymentHistory}
                                loading={paymentsLoading} />} />

                    <Route
                        exact
                        path="/account/activity/signers/"
                        render={() => <ActivitySignersHistory history={history} loading={loading} />} />

                    <Route
                        exact
                        path="/account/activity/trustlines/"
                        render={() => <ActivityTrustlinesHistory d={d} history={history} loading={loading} />} />


                    <Route render={() => <div>The requested page was not found.</div>} />
                </Switch>
            </div>
        );
    }
}
Activity.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
