import React from 'react';
import PropTypes from 'prop-types';
import Driver from '../../../../../lib/Driver';
import InfoBlock from '../../../../Common/InfoBlock/InfoBlock';

export default class LedgerAlert extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showInstructions: false,
        };
    }

    render() {
        let content;
        const { d, alertType } = this.props;

        switch (alertType) {
            case 'useChrome':
                content = (
                    <InfoBlock type="warning" withIcon title="Browser not supported">
                        <span>
                            Ledger Wallet is not supported by your browser. <br />
                            Please use Google Chrome to log in with Ledger.
                        </span>
                    </InfoBlock>
                );
                break;
            case 'useHttps':
                content = (
                    <InfoBlock
                        type="warning"
                        withIcon
                        onlyTitle
                        title={
                            <span>
                                Ledger only works on a https site.
                                <br />
                                Please use{' '}
                                <a href="https://stellarterm.com/" target="_blank" rel="nofollow noopener noreferrer">
                                    https://stellarterm.com/
                                </a>
                            </span>
                        }
                    />
                );
                break;
            case 'searching':
                content = (
                    <InfoBlock title="Connect your Ledger Wallet">
                        <p>Make sure your Ledger Wallet is connected with the Stellar application open on it.</p>
                        <p>If it still does not show up, restart your Ledger, and refresh this webpage.</p>
                        <button onClick={() => d.session.tryConnectLedger()} className="LoginPage__button">
                            Connect with Ledger
                        </button>
                    </InfoBlock>
                );
                break;
            default:
                break;
        }

        return (
            <React.Fragment>
                {content}

                {d && d.session && d.session.connectLedgerError && (
                    <InfoBlock type="error" withIcon title="Ledger connection error">
                        <span>
                            Could not connect to your Ledger Wallet. Make sure you are using a supported browser, have
                            the latest firmware version installed.
                        </span>
                    </InfoBlock>
                )}
            </React.Fragment>
        );
    }
}

LedgerAlert.propTypes = {
    alertType: PropTypes.string.isRequired,
    d: PropTypes.instanceOf(Driver),
};
