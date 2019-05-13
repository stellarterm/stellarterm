import React from 'react';
import PropTypes from 'prop-types';
import Ellipsis from '../../../../Common/Ellipsis/Ellipsis';

export default function LedgerAlert(props) {
    let ledgerAlert;

    switch (props.alertType) {
    case 'useChrome':
        ledgerAlert = (
                <p className="LoginPage__form--title browser-support">
                    Ledger is not supported on your browser.<br /> Please use Google Chrome,
                    Opera or Firefox with U2F extension.
                </p>
            );
        break;
    case 'useHttps':
        ledgerAlert = (
                <p className="LoginPage__form--title">
                    Ledger only works on a https site.
                    <br />
                    Please use{' '}
                    <a href="https://stellarterm.com/" target="_blank" rel="nofollow noopener noreferrer">
                        https://stellarterm.com/
                    </a>
                </p>
            );
        break;
    case 'searching':
        ledgerAlert = (
                <React.Fragment>
                    <p className="LoginPage__form--title">
                        Scanning for Ledger Wallet connection
                        <Ellipsis />
                    </p>
                    <p>Please plug in your Ledger and open the Stellar app. Make sure browser support is set to yes.</p>
                    <p>If it still does not show up, restart your Ledger, and refresh this webpage.</p>
                </React.Fragment>
            );
        break;
    default:
        break;
    }

    return <div className="LoginPage__form LoginPage__form--simpleMessage">{ledgerAlert}</div>;
}

LedgerAlert.propTypes = {
    alertType: PropTypes.string.isRequired,
};
