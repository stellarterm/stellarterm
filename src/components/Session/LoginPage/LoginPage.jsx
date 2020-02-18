import React from 'react';
import PropTypes from 'prop-types';
import Driver from '../../../lib/Driver';
import SignUpBody from './SignUpBody/SignUpBody';
import LedgerBody from './LedgerBody/LedgerBody';
import LoginPageBody from './LoginPageBody/LoginPageBody';
import HardwareWalletLoginLink from './Common/HardwareWalletLoginLink/HardwareWalletLoginLink';
import TrezorBody from './TrezorBody/TrezorBody';


export default function LoginPage(props) {
    const rootAddress = props.urlParts;
    let pageBody;

    switch (rootAddress) {
    case 'account':
        pageBody = (
            <div className="so-back islandBack islandBack--t">
                <div className="island">
                    <div className="LoginPage">
                        <LoginPageBody d={props.d} />
                    </div>
                </div>
            </div>
        );
        break;
    case 'ledger':
        pageBody = (
            <div className="so-back islandBack islandBack--t">
                <div className="island">
                    <div className="LoginPage">
                        <LedgerBody {...props} d={props.d} />
                    </div>
                </div>
            </div>
        );
        break;
    case 'trezor':
        pageBody = (
            <div className="so-back islandBack islandBack--t">
                <div className="island">
                    <div className="LoginPage">
                        <TrezorBody {...props} d={props.d} />
                    </div>
                </div>
            </div>
        );
        break;
    case 'signup':
        pageBody = <SignUpBody d={props.d} />;
        break;
    default:
        break;
    }

    return (
        <React.Fragment>
            {pageBody}
            {rootAddress === 'account' &&
                <React.Fragment>
                    <HardwareWalletLoginLink wallet={'ledger'} />
                    <HardwareWalletLoginLink wallet={'trezor'} />
                </React.Fragment>}
        </React.Fragment>
    );
}

LoginPage.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    urlParts: PropTypes.string,
};
