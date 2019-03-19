import React from 'react';
import PropTypes from 'prop-types';
import QRCode from 'qrcode.react';
import Generic from '../../Generic';
import Loading from '../../Loading';

export default function SessionActivate(props) {
    return (
        <Generic title={'Activate your account'}>
            <Loading darker left>
                <div className="s-alert s-alert--success">
                    Your Wallet Account ID: <strong>{props.unfundedAccountId}</strong>
                </div>
                <div className="LoginPage_qrcode">
                    <QRCode
                        value={props.unfundedAccountId} renderAs="svg" />
                </div>
                To use your Stellar account, you must activate it by sending at least 5 lumens (XLM) to your account.
                You can buy lumens (XLM) from an exchange and send them to your address.
            </Loading>
        </Generic>
    );
}

SessionActivate.propTypes = {
    unfundedAccountId: PropTypes.string.isRequired,
};
