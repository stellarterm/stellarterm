import React from 'react';
import PropTypes from 'prop-types';
import Driver from '../../../lib/Driver';
import ErrorBoundary from '../../ErrorBoundary';
import Inflation from './Inflation/Inflation';
import Deposit from './Deposit/Deposit';
import History from './History/History';
import Trust from './Trust/Trust';
import Send from './Send/Send';
import SessionAccountMenu from './SessionAccountMenu/SessionAccountMenu';
import SessionAccount from './SessionAccount/SessionAccount';

export default function SessionContent(props) {
    const routePath = props.route;
    const d = props.d;
    let content;

    switch (routePath) {
    case undefined:
        content = <SessionAccount d={d} />;
        break;
    case 'addTrust':
        content = <Trust d={d} />;
        break;
    case 'send':
        content = (
                <ErrorBoundary>
                    <div className="so-back islandBack islandBack--t">
                        <Send d={d} />
                    </div>
                </ErrorBoundary>
            );
        break;
    case 'settings':
        content = (
                <ErrorBoundary>
                    <Inflation d={d} />
                </ErrorBoundary>
            );
        break;
    case 'history':
        content = (
                <ErrorBoundary>
                    <History d={d} />
                </ErrorBoundary>
            );
        break;
    case 'deposit':
        content = (
                <ErrorBoundary>
                    <Deposit d={d} />
                </ErrorBoundary>
            );
        break;
    default:
        break;
    }

    return (
        <React.Fragment>
            <SessionAccountMenu d={d} />
            {content}
        </React.Fragment>
    );
}

SessionContent.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    route: PropTypes.string,
};
