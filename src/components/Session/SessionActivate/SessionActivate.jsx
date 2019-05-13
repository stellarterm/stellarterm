import React from 'react';
import PropTypes from 'prop-types';
import Generic from '../../Common/Generic/Generic';
import Loading from '../../Common/Loading/Loading';
import AccountIdBlock from '../AccountIdBlock/AccountIdBlock';

export default function SessionActivate(props) {
    return (
        <Generic title={'Activate your account'}>
            <Loading darker left>
                <AccountIdBlock accountID={props.unfundedAccountId} />
                To use your Stellar account, you must activate it by sending at least 5 lumens (XLM) to your account.
                You can buy lumens (XLM) from an exchange and send them to your address.
            </Loading>
        </Generic>
    );
}

SessionActivate.propTypes = {
    unfundedAccountId: PropTypes.string.isRequired,
};
