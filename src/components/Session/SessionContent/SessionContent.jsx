import React from 'react';
import PropTypes from 'prop-types';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import Driver from '../../../lib/Driver';
import Inflation from './Inflation/Inflation';
import Deposit from './Deposit/Deposit';
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
            <BrowserRouter>
                <SessionAccountMenu d={d} />
                <Switch>
                    <Route exact path="/account/" component={prop => <SessionAccount {...prop} d={d} />} />
                    <Route exact path="/account/addTrust/" component={prop => <Trust {...prop} d={d} />} />
                    <Route
                        exact
                        path="/account/send/"
                        component={prop => <ErrorBoundary><Send {...prop} d={d} /></ErrorBoundary>} />
                    <Route
                        exact
                        path="/account/settings/"
                        component={prop => <ErrorBoundary><Inflation {...prop} d={d} /></ErrorBoundary>} />
                    <Route
                        exact
                        path="/account/multisig/"
                        component={prop => <ErrorBoundary><Multisig {...prop} d={d} /></ErrorBoundary>} />
                    <Route
                        exact
                        path="/account/history/"
                        component={prop => <ErrorBoundary><History {...prop} d={d} /></ErrorBoundary>} />
                    <Route
                        exact
                        path="/account/deposit/"
                        component={prop => <ErrorBoundary><Deposit {...prop} d={d} /></ErrorBoundary>} />
                </Switch>
            </BrowserRouter>
        </React.Fragment>
    );
}

SessionContent.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
