import React from 'react';
import PropTypes from 'prop-types';
import LedgerSetupInstructions from './LedgerSetupInstructions/LedgerSetupInstructions';
import LedgerSetupNotes from './LedgerSetupNotes/LedgerSetupNotes';
import LedgerLogo from './LedgerLogo/LedgerLogo';
import LedgerAlert from './LedgerAlert/LedgerAlert';
import LedgerForm from './LedgerForm/LedgerForm';
import Driver from '../../../../lib/Driver';

export default class LedgerBody extends React.Component {
    static browserIsGoogleChrome() {
        // Checking for Google Chrome 1-71+
        return !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);
    }

    static isHttpConnectionUsed() {
        return window.location.protocol === 'http:';
    }

    render() {
        const d = this.props.d;
        const ledgerConnected = d.session.ledgerConnected;
        const isNotChrome = !this.constructor.browserIsGoogleChrome();
        const isHttp = this.constructor.isHttpConnectionUsed();
        let loginForm;

        if (isNotChrome) {
            loginForm = <LedgerAlert alertType={'useChrome'} />;
        } else if (isHttp) {
            loginForm = <LedgerAlert alertType={'useHttps'} />;
        } else if (!ledgerConnected) {
            loginForm = <LedgerAlert alertType={'searching'} />;
        } else if (ledgerConnected) {
            loginForm = <LedgerForm d={d} />;
        }

        return (
            <div className="LoginPage__body">
                <LedgerLogo />

                <div className="LoginPage__greenBox">{loginForm}</div>

                <div className="LoginBox__spacer">
                    <div className="LoginBox__divider" />
                </div>

                <LedgerSetupInstructions />
                <LedgerSetupNotes />
            </div>
        );
    }
}

LedgerBody.propTypes = {
    d: PropTypes.instanceOf(Driver),
};
