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
                    <InfoBlock
                        type="warning"
                        withIcon
                        onlyTitle
                        title={'Ledger is not supported on your browser. Please use Google Chrome'}
                    />
                );
                break;
            case 'useHttps':
                content = (
                    <InfoBlock type="warning">
                        <p className="LoginPage__form--title">
                            Ledger only works on a https site.
                            <br />
                            Please use{' '}
                            <a href="https://stellarterm.com/" target="_blank" rel="nofollow noopener noreferrer">
                                https://stellarterm.com/
                            </a>
                        </p>
                    </InfoBlock>
                );
                break;
            case 'searching':
                content = (
                    <InfoBlock title="Connect with Ledger">
                        <p>Make sure your Ledger Wallet is connected with the Stellar application open on it.</p>
                        <p>If it still does not show up, restart your Ledger, and refresh this webpage.</p>
                        <button onClick={() => d.session.tryConnectLedger()} className="s-button">
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
                    <InfoBlock inRow type="error" withIcon>
                        <span>Failed to connect Ledger! Please, try again.</span>
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
