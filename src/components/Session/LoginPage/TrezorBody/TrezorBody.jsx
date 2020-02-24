import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import TrezorConnect, { DEVICE_EVENT } from 'trezor-connect';
import Driver from '../../../../lib/Driver';
import SecretPhrase from '../SecretPhrase/SecretPhrase';
import images from '../../../../images';
import HiddenDescription from '../Common/HiddenDescription';
import AcceptTerms from '../Common/AcceptTerms';
import TrezorSetupInstructions from './TrezorSetupInstructions/TrezorSetupInstructions';
import TrezorSetupNotes from './TrezorSetupNotes/TrezorSetupNotes';


export default class TrezorBody extends React.Component {
    constructor(props) {
        super(props);
        TrezorConnect.manifest({
            email: 'support@stellarterm.com',
            appUrl: 'https://stellarterm.com',
        });

        this.state = {
            bip32Path: '0',
            customBip32Path: false,
            loginError: false,
            showInstructions: false,
        };

        TrezorConnect.on(DEVICE_EVENT, (event) => {
            if (event.type === 'device-disconnect') {
                this.props.d.session.handlers.logout();
            }
        });
    }

    getTrezorLoginForm() {
        const loginError = this.renderLoginError();
        const customPath = this.renderCustomPath();
        return (
            <form onSubmit={e => this.loginWithTrezor(e)}>
                <div className="LoginPage__submitWrap">
                    {loginError}
                    <AcceptTerms loginButtonText={'Sign in with Trezor'} />
                    <div className="LoginPage__customPath">
                        {customPath}
                    </div>
                </div>
            </form>
        );
    }

    loginWithTrezor(event) {
        event.preventDefault();
        this.setState({ loginError: false });
        const { bip32Path } = this.state;
        this.props.d.session.handlers.logInWithTrezor(`m/44'/148'/${bip32Path}'`)
            .then()
            .catch((e) => {
                console.log(e);
                this.setState({ loginError: e.message });
            });
    }

    handleBip32PathInput(event) {
        const int32Max = 2147483647;
        const valueSafeInteger = _.toSafeInteger(event.target.value);
        const value = valueSafeInteger > int32Max ? int32Max : valueSafeInteger;
        this.setState({ bip32Path: `${value}` });
    }

    enableAdvanced() {
        this.setState({ customBip32Path: true });
    }

    renderCustomPath() {
        const widthInPx = this.state.bip32Path.length * 8;
        const inputWidthStyle = { width: `${widthInPx + 28}px` };
        const { customBip32Path, bip32Path } = this.state;

        if (!customBip32Path) {
            return (
                <a onClick={() => this.enableAdvanced()}>
                    Advanced: Use custom BIP32 path
                </a>
            );
        }

        return (
            <label htmlFor="bip32Path" className="LoginPage__bip32Path">
                Path: <span className="">{"44'/148'/"}</span>
                <input
                    style={inputWidthStyle}
                    name="bip32Path"
                    type="text"
                    className="LoginPage__bip32PathInput"
                    value={bip32Path}
                    onChange={e => this.handleBip32PathInput(e)}
                    autoFocus
                    onFocus={(e) => {
                        // Move the carat to the end
                        const content = e.target.value;
                        e.target.value = '';
                        e.target.value = content;
                    }} />
                <span>{"'"}</span>
            </label>
        );
    }

    renderLoginError() {
        const { loginError } = this.state;
        if (loginError) {
            return (
                <div className="ErrorTransactionBlock">
                    <img src={images['icon-circle-fail']} alt="fail" />
                    <span>
                        {loginError}
                    </span>
                </div>
            );
        }
        return null;
    }

    render() {
        const { d, history, modal } = this.props;
        const { showInstructions } = this.state;
        const trezorLoginForm = this.getTrezorLoginForm();

        if (modal) {
            return (
                <div className="LoginPage__body LoginPage__popup">
                    <div className="LoginPage__greenBox">{trezorLoginForm}</div>
                </div>
            );
        }

        return (
            <React.Fragment>
                <div className="LoginPage_row-content">
                    <div className="LoginPage__body">
                        <div className="LoginPage__header">
                            <img
                                onClick={() => history.goBack()}
                                className="LoginPage__header-goBack"
                                src={images['icon-arrow-left-green-large']}
                                alt="<" />
                            <HiddenDescription />
                        </div>
                        <div className="LoginPage__header">
                            <div className="LoginPage__header-wrap">
                                <span className="LoginPage__title">Access your account</span>
                                <span className="LoginPage__intro">Use StellarTerm with your Trezor account</span>
                            </div>
                            <img src={images['trezor-full']} alt="trezor" width="133" />
                        </div>
                        <div className="LoginPage__greenBox">
                            {trezorLoginForm}
                        </div>
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
                {showInstructions &&
                    <div className="LoginPage_instructions-wrap">
                        <TrezorSetupInstructions />
                        <TrezorSetupNotes />
                    </div>
                }
            </React.Fragment>
        );
    }
}
TrezorBody.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    history: PropTypes.objectOf(PropTypes.any),
    modal: PropTypes.bool,
};
