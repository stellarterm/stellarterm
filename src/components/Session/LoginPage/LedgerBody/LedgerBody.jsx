import React from 'react';
import PropTypes from 'prop-types';
import Driver from '../../../../lib/Driver';
import LedgerForm from './LedgerForm/LedgerForm';
import LedgerAlert from './LedgerAlert/LedgerAlert';
import LedgerSetupNotes from './LedgerSetupNotes/LedgerSetupNotes';
import LedgerSetupInstructions from './LedgerSetupInstructions/LedgerSetupInstructions';
import SecretPhrase from '../SecretPhrase/SecretPhrase';
import HiddenDescription from '../Common/HiddenDescription';
import images from './../../../../images';
import {
    isChrome,
    isWindowsOS,
    browserU2FSupport,
    isHttpConnectionUsed,
} from '../../../../lib/BrowserSupport';

export default class LedgerBody extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showInstructions: false,
        };
    }

    componentDidMount() {
        if (!isWindowsOS()) {
            this.brakePing = this.props.d.session.pingLedger();
        }
    }

    componentWillUnmount() {
        if (!isWindowsOS()) { this.brakePing(); }
    }

    render() {
        const { d, modal } = this.props;
        const { showInstructions } = this.state;
        const ledgerConnected = d.session.ledgerConnected;
        let loginForm;

        if (!isChrome() && !browserU2FSupport()) {
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
                                alt="<" />
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
                        {!showInstructions &&
                            <span
                                className="LoginPage_green-link"
                                onClick={() => this.setState({ showInstructions: true })}>
                                Show setup instructions
                            </span>
                        }
                    </div>
                    <SecretPhrase d={d} />
                </div>
                {showInstructions && (
                    <div className="LoginPage_instructions-wrap">
                        <LedgerSetupInstructions />
                        <LedgerSetupNotes />
                    </div>)}
            </React.Fragment>
        );
    }
}

LedgerBody.propTypes = {
    d: PropTypes.instanceOf(Driver),
    modal: PropTypes.bool,
    history: PropTypes.objectOf(PropTypes.any),
};
