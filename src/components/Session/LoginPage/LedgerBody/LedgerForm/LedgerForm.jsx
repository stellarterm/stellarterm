import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import AcceptTerms from '../../Common/AcceptTerms';
import Driver from '../../../../../lib/Driver';

export default class LedgerForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            bip32Path: '0',
            ledgerAdvanced: false,
        };
    }

    handleBip32PathInput(event) {
        const int32Max = 2147483647;
        let value = _.toSafeInteger(event.target.value);
        if (value > int32Max) {
            value = int32Max;
        }
        this.setState({ bip32Path: `${value}` });
    }

    enableAdvanced() {
        this.setState({ ledgerAdvanced: true });
    }

    proceedWithLedger(event) {
        event.preventDefault();
        this.props.d.session.handlers.logInWithLedger(`44'/148'/${this.state.bip32Path}'`);
    }

    checkForErrorMessages() {
        const { setupLedgerError, setupError } = this.props.d.session;

        if (setupLedgerError) {
            // This usually doesn't happen. To simulate this, find the line:
            // new StellarLedger.Api(new StellarLedger.comm(NUMBER))
            // and change the number to something low so it has a timeout.
            // Or, put in a invalid bip path manually.
            return (
                <div className="s-alert s-alert--alert">
                    Connected to Ledger but returned an error: <br />
                    <strong>{setupLedgerError}</strong>
                </div>
            );
        }
        if (setupError) {
            return (
                <div className="s-alert s-alert--alert">
                    Unable to contact network.Please check your internet connection and allow connections to
                    horizon.stellar.org. Maybe an adblocker or plugin (such as Privacy Badger) is preventing the client
                    from communicating with the network.
                </div>
            );
        }
        return null;
    }

    renderCustomPath() {
        const widthInPx = this.state.bip32Path.length * 8;
        const inputWidthStyle = { width: `${widthInPx + 28}px` };
        const { ledgerAdvanced, bip32Path } = this.state;

        if (!ledgerAdvanced) {
            return (
                <a className="LoginPage__activateCustomPath" onClick={() => this.enableAdvanced()}>
                    Advanced: Use custom BIP32 path
                </a>
            );
        }

        return (
            <label className="LoginPage__customPath" htmlFor="bip32Path">
                Path: <span className="LoginPage__customPath__surrounding">{"44'/148'/"}</span>
                <input
                    style={inputWidthStyle}
                    name="bip32Path"
                    type="text"
                    className="s-inputGroup__item LoginPage__customPath__input"
                    value={bip32Path}
                    onChange={e => this.handleBip32PathInput(e)}
                    autoFocus
                    onFocus={(e) => {
                        // Move the carat to the end
                        const content = e.target.value;
                        e.target.value = '';
                        e.target.value = content;
                    }} />
                <span className="LoginPage__customPath__surrounding">{"'"}</span>
            </label>
        );
    }

    render() {
        const ledgerErrorMessage = this.checkForErrorMessages();
        const customPath = this.renderCustomPath();

        return (
            <div className="LoginPage__form">
                <p className="LoginPage__form--title">Ledger Wallet found and connected!</p>

                <form onSubmit={e => this.proceedWithLedger(e)}>
                    <div className="s-inputGroup LoginPage__inputGroup">
                        {ledgerErrorMessage}
                        <AcceptTerms loginButtonText={'Sign in with Ledger'} />
                        {customPath}
                    </div>
                </form>
            </div>
        );
    }
}

LedgerForm.propTypes = {
    d: PropTypes.instanceOf(Driver),
};
