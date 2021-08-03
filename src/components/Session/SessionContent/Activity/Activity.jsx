import React from 'react';
import PropTypes from 'prop-types';
import { Switch, Route } from 'react-router-dom';
import Driver from '../../../../lib/Driver';
import NotFound from '../../../NotFound/NotFound';
import ActivityNavMenu from './ActivitityNavMenu/ActivityNavMenu';
import ActivityOpenOrders from './ActivityOpenOrders/ActivityOpenOrders';
import ActivityTradesHistory from './ActivityTradesHistory/ActivityTradesHistory';
import ActivityPaymentsHistory from './ActivityPaymentsHistory/ActivityPaymentsHistory';
import ActivitySignersHistory from './ActivitySignersHistory/ActivitySignersHistory';
import ActivityTrustlinesHistory from './ActivityTrustlinesHistory/ActivityTrustlinesHistory';

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
    componentDidMount() {
        this.unlisten = this.props.d.claimableBalances.event.sub(() => {
            this.forceUpdate();
        });
    }

    componentWillUnmount() {
        this.unlisten();
    }

    render() {
        const { d } = this.props;

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
                            />}
                    />

                    <Route
                        exact
                        path="/account/activity/payments/"
                        render={() =>
                            <ActivityPaymentsHistory
                                d={d}
                            />}
                    />

                    <Route
                        exact
                        path="/account/activity/signers/"
                        render={() =>
                            <ActivitySignersHistory
                                d={d}
                            />}
                    />
                    <Route
                        exact
                        path="/account/activity/trustlines/"
                        render={() =>
                            <ActivityTrustlinesHistory
                                d={d}
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
