import React from 'react';
import PropTypes from 'prop-types';
import Ellipsis from '../../../../Common/Ellipsis/Ellipsis';
import Driver from '../../../../../lib/Driver';
import { isWindowsOS } from '../../../../../lib/BrowserSupport';

export default function LedgerAlert(props) {
    let ledgerAlert;
    const { d } = props;

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
                {!isWindowsOS() && <p className="LoginPage__form--title">
                        Scanning for Ledger Wallet connection
                    <Ellipsis />
                </p>}
                <p>Please plug in your Ledger and open the Stellar app. Make sure browser support is set to yes.</p>
                <p>If it still does not show up, restart your Ledger, and refresh this webpage.</p>
                {isWindowsOS() &&
                        <button
                            onClick={() => d.session.pingLedger(true)}
                            className="s-button">Check Ledger connection</button>}
            </React.Fragment>
        );
        break;
    default:
        break;
    }

    return <div className="LoginPage__greenBox">{ledgerAlert}</div>;
}

LedgerAlert.propTypes = {
    alertType: PropTypes.string.isRequired,
    d: PropTypes.instanceOf(Driver),
};
