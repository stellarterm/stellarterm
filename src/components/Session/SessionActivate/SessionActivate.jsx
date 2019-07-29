import React from 'react';
import PropTypes from 'prop-types';
import Generic from '../../Common/Generic/Generic';
import AccountIdBlock from '../AccountIdBlock/AccountIdBlock';
import SessionAccountMenu from '../SessionContent/SessionAccountMenu/SessionAccountMenu';
import Driver from '../../../lib/Driver';

export default function SessionActivate(props) {
    return (
        <React.Fragment>
            <SessionAccountMenu d={props.d} onlyLogoutNav />
            <Generic title={'Activate your account'}>
                <div className="notActivatedBlock">
                    <AccountIdBlock accountID={props.unfundedAccountId} />
                    <p>
                        To use your Stellar account, you must activate it by sending at least 5 lumens (XLM) to your
                        account. You can buy lumens (XLM) from an exchange and send them to your address.
                    </p>
                </div>
            </Generic>
        </React.Fragment>
    );
}

SessionActivate.propTypes = {
    unfundedAccountId: PropTypes.string.isRequired,
    d: PropTypes.instanceOf(Driver).isRequired,
};
