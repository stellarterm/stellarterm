import React from 'react';
import PropTypes from 'prop-types';
import Driver from '../../../lib/driver/Driver';
import SignUpBody from './SignUpBody/SignUpBody';
import LedgerBody from './LedgerBody/LedgerBody';
import LoginPageBody from './LoginPageBody/LoginPageBody';
import TrezorBody from './TrezorBody/TrezorBody';
import FreighterBody from './FreighterBody/FreighterBody';
import WalletConnectBody from './WalletConnectBody/WalletConnectBody';
import LoginLinks from './Common/LoginLinksBlock/LoginLinks';
import LobstrExtensionBody from './LobstrExtensionBody/LobstrExtensionBody';


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
        case 'freighter':
            pageBody = (
                <div className="so-back islandBack islandBack--t">
                    <div className="island">
                        <div className="LoginPage">
                            <FreighterBody {...props} d={props.d} />
                        </div>
                    </div>
                </div>
            );
            break;
        case 'wallet-connect':
            pageBody = (
                <div className="so-back islandBack islandBack--t">
                    <div className="island">
                        <div className="LoginPage">
                            <WalletConnectBody {...props} d={props.d} />
                        </div>
                    </div>
                </div>
            );
            break;
        case 'lobstr':
            pageBody = (
                <div className="so-back islandBack islandBack--t">
                    <div className="island">
                        <div className="LoginPage">
                            <LobstrExtensionBody {...props} d={props.d} />
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
                <LoginLinks />}
        </React.Fragment>
    );
}

LoginPage.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    urlParts: PropTypes.string,
};
