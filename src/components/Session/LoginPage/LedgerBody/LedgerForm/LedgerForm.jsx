import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import Driver from '../../../../../lib/Driver';
import AcceptTerms from '../../Common/AcceptTerms';
import InfoBlock from '../../../../Common/InfoBlock/InfoBlock';

export default class LedgerForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            bip32Path: '0',
            ledgerAdvanced: false,
        };
    }

    componentWillUnmount() {
        this.props.d.session.setupLedgerError = null;
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
            return (
                <InfoBlock withIcon type="error" title="Connected to Ledger but returned an error:">
                    <span>
                        {setupLedgerError === 'Ledger device: UNKNOWN_ERROR (0x6804)'
                            ? 'Ledger locked after idle timeout. Please unlock your device.'
                            : setupLedgerError}
                    </span>
                </InfoBlock>
            );
        }
        if (setupError) {
            return (
                <InfoBlock withIcon type="error" title="Unable to contact network.">
                    <span>
                        Please check your internet connection and allow connections to horizon.stellar.org. Maybe an
                        adblocker or plugin (such as Privacy Badger) is preventing the client from communicating with
                        the network.
                    </span>
                </InfoBlock>
            );
        }
        return null;
    }

    renderCustomPath() {
        const widthInPx = this.state.bip32Path.length * 8;
        const inputWidthStyle = { width: `${widthInPx + 28}px` };
        const { ledgerAdvanced, bip32Path } = this.state;

        if (!ledgerAdvanced) {
            return <a onClick={() => this.enableAdvanced()}>Advanced: Use custom BIP32 path</a>;
        }

        return (
            <label htmlFor="bip32Path" className="LoginPage__bip32Path">
                Path: <span className="">{'44\'/148\'/'}</span>
                <input
                    style={inputWidthStyle}
                    name="bip32Path"
                    type="text"
                    className="LoginPage__bip32PathInput"
                    value={bip32Path}
                    onChange={e => this.handleBip32PathInput(e)}
                    autoFocus
                    onFocus={e => {
                        // Move the carat to the end
                        const content = e.target.value;
                        e.target.value = '';
                        e.target.value = content;
                    }}
                />
                <span>{'\''}</span>
            </label>
        );
    }

    render() {
        const ledgerErrorMessage = this.checkForErrorMessages();
        const customPath = this.renderCustomPath();

        return (
            <React.Fragment>
                <div className="LoginPage__greenBox">
                    <p className="LoginPage__form--title">Ledger Wallet found and connected!</p>
                    <form onSubmit={e => this.proceedWithLedger(e)}>
                        <div className="LoginPage__submitWrap">
                            <AcceptTerms loginButtonText={'Connect with Ledger'} />
                            <div className="LoginPage__customPath">{customPath}</div>
                        </div>
                    </form>
                </div>
                {ledgerErrorMessage}
            </React.Fragment>
        );
    }
}

LedgerForm.propTypes = {
    d: PropTypes.instanceOf(Driver),
};
