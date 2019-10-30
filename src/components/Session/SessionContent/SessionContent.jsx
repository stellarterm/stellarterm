import React from 'react';
import PropTypes from 'prop-types';
import { Switch, Route, Redirect } from 'react-router-dom';
import Driver from '../../../lib/Driver';
import Inflation from './Inflation/Inflation';
import Deposit from './Deposit/Deposit';
import Trust from './Trust/Trust';
import Send from './Send/Send';
import SessionAccount from './SessionAccount/SessionAccount';
import Multisig from './Multisig/Multisig';
import ErrorBoundary from '../../Common/ErrorBoundary/ErrorBoundary';
import SessionAccountMenu from './SessionAccountMenu/SessionAccountMenu';
import NotFound from '../../NotFound/NotFound';
import Activity from './Activity/Activity';

export default function SessionContent(props) {
    const d = props.d;

    return (
        <React.Fragment>
            <SessionAccountMenu d={d} />
            <Switch>
                <Route exact path="/account/" render={prop => <SessionAccount {...prop} d={d} />} />
                <Route exact path="/account/addTrust/" render={prop => <Trust {...prop} d={d} />} />
                <Route
                    exact
                    path="/account/send/"
                    render={prop => <ErrorBoundary><Send {...prop} d={d} /></ErrorBoundary>} />
                <Route
                    exact
                    path="/account/settings/"
                    render={prop => <ErrorBoundary><Inflation {...prop} d={d} /></ErrorBoundary>} />
                <Route
                    exact
                    path="/account/multisig/"
                    render={prop => <ErrorBoundary><Multisig {...prop} d={d} /></ErrorBoundary>} />
                <Route
                    path="/account/activity/"
                    render={prop => <ErrorBoundary><Activity {...prop} d={d} /></ErrorBoundary>} />
                <Route
                    exact
                    path="/account/deposit/"
                    render={prop => <ErrorBoundary><Deposit {...prop} d={d} /></ErrorBoundary>} />
                <Redirect from="/ledger/" to="/account/" />
                <Route render={() => <NotFound />} />
            </Switch>
        </React.Fragment>
    );
}

SessionContent.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
