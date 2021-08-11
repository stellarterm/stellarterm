import React, { useState } from 'react';
import PropTypes from 'prop-types';
import createStellarIdenticon from 'stellar-identicon-js';
import Ellipsis from '../../../../Common/Ellipsis/Ellipsis';


const ClaimantsList = ({ promiseWithAddresses }) => {
    const [addresses, setAddresses] = useState(null);

    promiseWithAddresses.then(res => {
        setAddresses(res);
    });

    if (!addresses) {
        return <Ellipsis />;
    }

    if (addresses.length === 1) {
        const renderedIcon = createStellarIdenticon(addresses[0]).toDataURL();
        const viewAddress = `${addresses[0].substr(0, 18)}...${addresses[0].substr(-12, 12)}`;
        return (
            <React.Fragment>
                <div className="Activity-table-identicon">
                    <img src={renderedIcon} alt="id" />
                </div>
                {viewAddress}
            </React.Fragment>
        );
    }

    return (
        <React.Fragment>
            {addresses
                .slice(0, 10)
                .map(address => {
                    const renderedIcon = createStellarIdenticon(address).toDataURL();

                    return (
                        <div className="Activity-table-identicon Activity-table-identicon-list">
                            <img src={renderedIcon} alt="id" />
                        </div>
                    );
                })}
            <span className="Activity-table-identicon-list-count">{addresses.length} claimants</span>
        </React.Fragment>

    );
};
ClaimantsList.propTypes = {
    promiseWithAddresses: PropTypes.instanceOf(Promise),
};

export default ClaimantsList;

