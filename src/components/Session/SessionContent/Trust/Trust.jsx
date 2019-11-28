import React from 'react';
import PropTypes from 'prop-types';
import Driver from '../../../../lib/Driver';
import ManageTrust from './ManageTrust/ManageTrust';
import ManuallyAddTrust from './ManuallyAddTrust/ManuallyAddTrust';
import SearchByAnchor from '../../../Common/SearchByAnchor/SearchByAnchor';
import AddTrustFromDirectory from './AddTrustFromDirectory/AddTrustFromDirectory';

export default function Trust(props) {
    const d = props.d;

    return (
        <React.Fragment>
            <div className="so-back islandBack islandBack--t">
                <ManageTrust d={d} />
            </div>
            <div className="so-back islandBack">
                <SearchByAnchor d={d} />
            </div>
            <div className="so-back islandBack">
                <AddTrustFromDirectory d={d} />
            </div>
            <div className="so-back islandBack">
                <ManuallyAddTrust d={d} />
            </div>
        </React.Fragment>
    );
}

Trust.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
