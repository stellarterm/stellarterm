import React from 'react';
import PropTypes from 'prop-types';
import Driver from '../../lib/Driver';
import ErrorBoundary from '../ErrorBoundary';
import ManageCurrentTrust from '../Session/ManageCurrentTrust';
import ManuallyAddTrust from '../Session/ManuallyAddTrust';
import AddTrustFromFederation from '../Session/AddTrustFromFederation';
import AddTrustFromDirectory from '../Session/AddTrustFromDirectory';

export default function SessionAddTrust(props) {
    const d = props.d;
    return (
        <ErrorBoundary>
            <div className="so-back islandBack islandBack--t">
                <ManageCurrentTrust d={d} />
            </div>
            <div className="so-back islandBack">
                <AddTrustFromFederation d={d} />
            </div>
            <div className="so-back islandBack">
                <AddTrustFromDirectory d={d} />
            </div>
            <div className="so-back islandBack">
                <ManuallyAddTrust d={d} />
            </div>
        </ErrorBoundary>
    );
}

SessionAddTrust.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
