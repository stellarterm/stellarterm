import React from 'react';
import PropTypes from 'prop-types';
import Driver from '../../../../lib/Driver';
import Federation from './Federation/Federation';
import AccountView from './AccountView/AccountView';
import Generic from '../../../Common/Generic/Generic';
import AccountIdBlock from '../../AccountIdBlock/AccountIdBlock';

export default function SessionAccount(props) {
    const accountID = props.d.session.account.accountId();

    return (
        <React.Fragment>
            <Generic>
                <AccountIdBlock accountID={accountID} />
                <p className="AccountView_text">
                    To receive payments, share your account ID with them (begins with a G) or scan QR code.
                </p>

                <Federation d={props.d} />
            </Generic>

            <AccountView d={props.d} />
        </React.Fragment>
    );
}

SessionAccount.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
