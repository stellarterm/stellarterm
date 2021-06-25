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
import NotFound from '../../../NotFound/NotFound';

export const ROW_HEIGHT = 47;
export const TABLE_MAX_HEIGHT = Math.max(window.innerHeight - 470, 376);
export const SCROLL_WIDTH = 17;
export const formatDate = timestamp => {
    const date = new Date(timestamp).toLocaleDateString();
    const time = new Date(timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });
    const [hours, minutes] = time.split(':');

    if (+hours < 24) {
        return { time, date };
    }

    const formattedHours = `0${hours - 24}`.slice(-2);
    return {
        time: `${formattedHours}:${minutes}`,
        date,
    };
};

export default class Activity extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [],
            historyLoading: false,
            historyNext: undefined,
            historyIsFull: false,
            paymentHistory: [],
            paymentHistoryLoading: false,
            paymentHistoryNext: undefined,
            paymentHistoryIsFull: false,
        };
    }

    componentDidMount() {
        this.loadHistory();
    }

    componentDidUpdate() {
        this.loadHistory();
    }

    getHistory() {
        this.setState({ historyLoading: true });
        this.props.d.accountEvents.getOperations(200).then(history => {
            this.setState({
                history: history.records,
                historyNext: history.next,
                historyLoading: false,
            });
        });
    }

    getPaymentHistory() {
        this.setState({ paymentHistoryLoading: true });
        this.props.d.accountEvents.getPaymentsHistory(200).then(history => {
            this.setState({
                paymentHistory: history.records,
                paymentHistoryNext: history.next,
                paymentHistoryLoading: false,
            });
        });
    }

    loadHistory() {
        if (window.location.pathname !== '/account/activity/' && (this.state.history.length === 0)
            && !this.state.historyLoading) {
            this.getHistory();
        }
        if (window.location.pathname === '/account/activity/payments/' && (this.state.paymentHistory.length === 0)
            && !this.state.paymentHistoryLoading) {
            this.getPaymentHistory();
        }
    }

    loadMore(next, historyType) {
        if (this.state[`${historyType}Loading`] || this.state[`${historyType}IsFull`] || !next) {
            return;
        }
        this.setState({ [`${historyType}Loading`]: true });
        next().then(res => {
            if (res.records.length === 0) {
                this.setState({ [`${historyType}Loading`]: false, [`${historyType}IsFull`]: true });
                return;
            }

            this.setState({
                [historyType]: [...this.state[historyType], ...res.records],
                [`${historyType}Next`]: res.next,
                [`${historyType}Loading`]: false,
            });
        });
    }

    render() {
        const { d } = this.props;
        const { history, historyLoading, historyIsFull, paymentHistory, paymentHistoryLoading } = this.state;
        const openOffers = Object.values(d.session.account.offers)
            .sort((a, b) => {
                if (!a.last_modified_time) {
                    return -1;
                }
                if (!b.last_modified_time) {
                    return 1;
                }
                return (new Date(b.last_modified_time).getTime() - new Date(a.last_modified_time).getTime());
            });

        const hasOpenOffers = !!openOffers.length;

        return (
            <div className="island Activity">
                <ActivityNavMenu hasOpenOffers={hasOpenOffers} />
                <Switch>
                    <Route
                        exact
                        path="/account/activity/"
                        render={() => <ActivityOpenOrders openOffers={openOffers} d={d} />}
                    />

                    <Route
                        exact
                        path="/account/activity/trade/"
                        render={() =>
                            <ActivityTradesHistory
                                d={d}
                                loadMore={() => this.loadMore(this.state.historyNext, 'history')}
                                isFull={historyIsFull}
                                history={history}
                                loading={historyLoading}
                            />}
                    />

                    <Route
                        exact
                        path="/account/activity/payments/"
                        render={() =>
                            <ActivityPaymentsHistory
                                d={d}
                                loadMore={() => this.loadMore(this.state.paymentHistoryNext, 'paymentHistory')}
                                allHistory={history}
                                history={paymentHistory}
                                loading={paymentHistoryLoading}
                            />}
                    />

                    <Route
                        exact
                        path="/account/activity/signers/"
                        render={() =>
                            <ActivitySignersHistory
                                d={d}
                                history={history}
                                isFull={historyIsFull}
                                loadMore={() => this.loadMore(this.state.historyNext, 'history')}
                                loading={historyLoading}
                            />}
                    />
                    <Route
                        exact
                        path="/account/activity/trustlines/"
                        render={() =>
                            <ActivityTrustlinesHistory
                                d={d}
                                loadMore={() => this.loadMore(this.state.historyNext, 'history')}
                                isFull={historyIsFull}
                                history={history}
                                loading={historyLoading}
                            />}
                    />

                    <Route render={() => <NotFound withoutWrapper />} />
                </Switch>
            </div>
        );
    }
}
Activity.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
