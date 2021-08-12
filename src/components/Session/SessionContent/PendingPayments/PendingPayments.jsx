import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Route, Switch } from 'react-router-dom';
import NotFound from '../../../NotFound/NotFound';
import Driver from '../../../../lib/Driver';
import ActivityNavMenu from '../Activity/ActivitityNavMenu/ActivityNavMenu';
import ActivePendingPayments from './ActivePendingPayments/ActivePendingPayments';
import HistoryPendingPayments from './HistoryPendingPayments/HistoryPendingPayments';


const PendingPayments = ({ d }) => {
    const [hasPendingPayments, setHasPendingPayments] =
        useState(Boolean(d.claimableBalances.pendingClaimableBalancesCount));

    useEffect(() => {
        const unsub = this.props.d.claimableBalances.event.sub(() => {
            setHasPendingPayments(Boolean(d.claimableBalances.pendingClaimableBalancesCount));
        });

        return () => unsub();
    }, []);


    return (
        <div className="island Activity">
            <div className="ActivityNavMenu">
                {ActivityNavMenu.getMenuItem(
                    '/account/pending-payments/',
                    'Pending',
                    hasPendingPayments,
                )}
                {ActivityNavMenu.getMenuItem('/account/pending-payments/history/', 'History')}
            </div>

            <Switch>
                <Route
                    exact
                    path="/account/pending-payments/"
                    render={() => <ActivePendingPayments d={d} />}
                />

                <Route
                    exact
                    path="/account/pending-payments/history/"
                    render={() =>
                        <HistoryPendingPayments
                            d={d}
                        />}
                />

                <Route render={() => <NotFound withoutWrapper />} />
            </Switch>
        </div>
    );
};
PendingPayments.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};

export default PendingPayments;

