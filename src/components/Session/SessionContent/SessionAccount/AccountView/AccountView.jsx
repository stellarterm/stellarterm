import React from 'react';
import PropTypes from 'prop-types';
import Driver from '../../../../../lib/Driver';

import BalancesTable from './BalancesTable/BalancesTable';
import MinBalance from './MinBalance/MinBalance';

export default function AccountView(props) {
    return (
        <div>
            <div className="so-back islandBack">
                <div className="island">
                    <div className="island__header">Balances</div>
                    <div className="AccountView_content">
                        By default, your account is only configured to accept <strong>XLM</strong>. In order to receive
                        other assets, you must <a href="#account/addTrust">accept</a> them using the{' '}
                        <strong>Accept assets</strong> tool.
                    </div>
                    <BalancesTable d={props.d} />
                </div>
            </div>
            <div className="so-back islandBack">
                <div className="island">
                    <div className="island__header">Minimum Balance</div>
                    <MinBalance d={props.d} />
                </div>
            </div>
        </div>
    );
}

AccountView.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
