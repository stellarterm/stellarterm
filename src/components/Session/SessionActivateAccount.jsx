import React from 'react';
import PropTypes from 'prop-types';
import Generic from '../Generic';
import Loading from '../Loading';

export default function SessionActivateAccount(props) {
    return (
        <Generic title={'Activate your account'}>
            <Loading darker left>
                <div className="s-alert s-alert--success">
                    Your Wallet Account ID: <strong>{props.unfundedAccountId}</strong>
                </div>
                To use your Stellar account, you must activate it by sending at least 5 lumens (XLM) to your account.
                You can buy lumens (XLM) from an exchange and send them to your address.
            </Loading>
        </Generic>
    );
}

SessionActivateAccount.propTypes = {
    unfundedAccountId: PropTypes.string.isRequired,
};
