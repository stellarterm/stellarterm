import React from 'react';
import PropTypes from 'prop-types';
import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import Driver from '../../../../lib/driver/Driver';
import { isHttpConnectionUsed } from '../../../../lib/helpers/BrowserSupport';
import SecretPhrase from '../SecretPhrase/SecretPhrase';
import HiddenDescription from '../Common/HiddenDescription';
import { SESSION_EVENTS } from '../../../../lib/constants/sessionConstants';
import LedgerForm from './LedgerForm/LedgerForm';
import LedgerAlert from './LedgerAlert/LedgerAlert';
import LedgerSetupNotes from './LedgerSetupNotes/LedgerSetupNotes';
import LedgerSetupInstructions from './LedgerSetupInstructions/LedgerSetupInstructions';
import images from './../../../../images';


export default class LedgerBody extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showInstructions: false,
            isWebUsbSupported: false,
            error: '',
        };
    }

    componentDidMount() {
        TransportWebUSB.isSupported()
            .then(isSupported => this.setState({ isWebUsbSupported: isSupported }))
            .catch(error => this.setState({ error }));

        this.unsub = this.props.d.session.event.sub(event => {
            if (event === SESSION_EVENTS.LEDGER_EVENT) {
                this.forceUpdate();
            }
        });
    }

    componentWillUnmount() {
        this.props.d.session.connectLedgerError = null;
        this.unsub();
    }

    render() {
        const { d, modal } = this.props;
        const { showInstructions, isWebUsbSupported } = this.state;
        const ledgerConnected = d.session.ledgerConnected;
        let loginForm;

        if (!isWebUsbSupported) {
            loginForm = <LedgerAlert alertType={'useChrome'} />;
        } else if (isHttpConnectionUsed()) {
            loginForm = <LedgerAlert alertType={'useHttps'} />;
        } else if (!ledgerConnected) {
            loginForm = <LedgerAlert alertType={'searching'} d={d} />;
        } else if (ledgerConnected) {
            loginForm = <LedgerForm d={d} />;
        }

        if (modal) {
            return (
                <div className="LoginPage__body LoginPage__popup">
                    <div className="LoginPage__greenBox">{loginForm}</div>
                </div>
            );
        }

        return (
            <React.Fragment>
                <div className="LoginPage_row-content">
                    <div className="LoginPage__body">
                        <div className="LoginPage__header">
                            <img
                                onClick={() => this.props.history.goBack()}
                                className="LoginPage__header-goBack"
                                src={images['icon-arrow-left-green-large']}
                                alt="<"
                            />
                            <HiddenDescription />
                        </div>
                        <div className="LoginPage__header">
                            <div className="LoginPage__header-wrap">
                                <span className="LoginPage__title">Access your account</span>
                                <span className="LoginPage__intro">Use StellarTerm with your Ledger account</span>
                            </div>
                            <img src={images['ledger-logo']} alt="ledger" width="133" />
                        </div>
                        {loginForm}
                        {!showInstructions && (
                            <span
                                className="LoginPage_green-link"
                                onClick={() => this.setState({ showInstructions: true })}
                            >
                                Show setup instructions
                            </span>
                        )}
                    </div>
                    <SecretPhrase d={d} />
                </div>
                {showInstructions && (
                    <div className="LoginPage_instructions-wrap">
                        <LedgerSetupInstructions />
                        <LedgerSetupNotes />
                    </div>
                )}
            </React.Fragment>
        );
    }
}

LedgerBody.propTypes = {
    d: PropTypes.instanceOf(Driver),
    modal: PropTypes.bool,
    history: PropTypes.objectOf(PropTypes.any),
};
