import React from 'react';
import PropTypes from 'prop-types';
import Driver from '../../lib/Driver';
import ErrorBoundary from '../ErrorBoundary';
import Send from '../Session/Send';
import Inflation from '../Session/Inflation';
import Deposit from '../Session/Deposit';
import HistoryView from '../Session/HistoryView';
import SessionAccountMenu from './SessionAccountMenu';
import SessionAccountView from './SessionAccountView';
import SessionAddTrust from './SessionAddTrust';

export default function SessionPageContent(props) {
    const routePath = props.route;
    const d = props.d;
    let content;

    switch (routePath) {
    case undefined:
        content = <SessionAccountView d={d} />;
        break;
    case 'addTrust':
        content = <SessionAddTrust d={d} />;
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
                    <HistoryView d={d} />
                </ErrorBoundary>
            );
        break;
    case 'deposit':
        content = (
                <div>
                    <Deposit d={d} />
                </div>
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

SessionPageContent.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    route: PropTypes.string,
};
