import React from 'react';
import PropTypes from 'prop-types';
import { Switch, Route, Redirect } from 'react-router-dom';
import Driver from '../../../lib/Driver';
import Inflation from './Inflation/Inflation';
import History from './History/History';
import Trust from './Trust/Trust';
import Send from './Send/Send';
import SessionAccount from './SessionAccount/SessionAccount';
import Multisig from './Multisig/Multisig';
import ErrorBoundary from '../../Common/ErrorBoundary/ErrorBoundary';
import SessionAccountMenu from './SessionAccountMenu/SessionAccountMenu';

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
                    exact
                    path="/account/history/"
                    render={prop => <ErrorBoundary><History {...prop} d={d} /></ErrorBoundary>} />
                <Redirect from="/ledger/" to="/account/" />
            </Switch>
        </React.Fragment>
    );
}

SessionContent.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
