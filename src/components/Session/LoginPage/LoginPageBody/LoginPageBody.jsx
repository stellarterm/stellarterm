import React from 'react';
import PropTypes from 'prop-types';
import * as StellarSdk from 'stellar-sdk';
import Driver from '../../../../lib/driver/Driver';
import AcceptTerms from '../Common/AcceptTerms';
import images from '../../../../images';
import SecretPhrase from '../SecretPhrase/SecretPhrase';
import HiddenDescription from '../Common/HiddenDescription';

export default class LoginPageBody extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            secretInput: '',
            invalidKey: false,
            show: false,
        };
    }

    getHeader() {
        const { verifySignUp, prevSignUpStep, modal } = this.props;
        if (verifySignUp) {
            return (
                <React.Fragment>
                    <div className="LoginPage__header">
                        <div className="SignUpGenerateKeyPair_header-back">
                            <img src={images['icon-arrow-left-green-large']} alt="<" onClick={() => prevSignUpStep()} />
                        </div>
                        <HiddenDescription />
                    </div>
                    <div className="LoginPage__header">
                        <span className="LoginPage__title">Verify secret key</span>
                    </div>
                </React.Fragment>
            );
        }

        if (modal) {
            return null;
        }

        return (
            <div className="LoginPage__header">
                <span className="LoginPage__title">Access your account</span>
                <HiddenDescription />
            </div>
        );
    }

    getIntro() {
        const { verifySignUp, modal } = this.props;
        if (verifySignUp) {
            return (
                'Verify that you’ve saved the secret key of your new Stellar account. It will not be shown to you again.'
            );
        }
        if (modal) {
            return null;
        }

        return (
            'Log in with your secret key to manage Stellar account.'
        );
    }

    handleSubmit(event) {
        event.preventDefault();
        const secretKeyInput = this.state.secretInput;

        try {
            StellarSdk.Keypair.fromSecret(secretKeyInput);
            return this.props.d.session.handlers.logInWithSecret(secretKeyInput);
        } catch (e) {
            return this.setState({ invalidKey: true });
        }
    }

    toggleShow(event) {
        event.preventDefault();
        this.setState({ show: !this.state.show });
    }

    handleInput(event) {
        this.setState({ secretInput: event.target.value });
    }

    checkForErrorMessages() {
        const isSetupError = this.props.d.session.setupError;
        const isInvalidKey = this.state.invalidKey;

        if (isInvalidKey) {
            return (
                <div className="ErrorTransactionBlock">
                    <img src={images['icon-circle-fail']} alt="fail" />
                    <span>Invalid secret key. Hint: it starts with the letter S and is all uppercase</span>
                </div>
            );
        } else if (isSetupError) {
            return (
                <div className="ErrorTransactionBlock">
                    <img src={images['icon-circle-fail']} alt="fail" />
                    <span>
                    Unable to contact network. Please check your internet connection and allow connections to
                    horizon.stellar.org. Maybe an adblocker or plugin (such as Privacy Badger) is preventing the client
                    from communicating with the network.
                    </span>
                </div>
            );
        }
        return null;
    }

    render() {
        const { show } = this.state;
        const { verifySignUp, modal } = this.props;
        const loginErrorMessage = this.checkForErrorMessages();
        const inputType = show ? 'text' : 'password';
        const toggleButtonIcon = show ? 'icon-eye' : 'icon-eye-hide';
        const header = this.getHeader();
        const intro = this.getIntro();

        return (
            <React.Fragment>
                <div className="LoginPage_row-content">
                    <div className={`LoginPage__body ${modal ? 'LoginPage__popup' : ''}`}>
                        {header}
                        <div className="LoginPage__form">
                            <p className="LoginPage__intro">{intro}</p>
                            <p>Enter secret key</p>
                            <form onSubmit={e => this.handleSubmit(e)}>
                                <label className="LoginPage__inputGroup" htmlFor="inputSecretKey">
                                    <input
                                        name="inputSecretKey"
                                        type={inputType}
                                        className="LoginPage__password"
                                        value={this.state.secretInput}
                                        maxLength={56}
                                        onChange={e => this.handleInput(e)}
                                        placeholder="Sxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
                                    <img
                                        src={images[toggleButtonIcon]}
                                        alt="show"
                                        className="LoginPage__show_icon"
                                        onClick={e => this.toggleShow(e)} />
                                </label>

                                {loginErrorMessage}
                                <AcceptTerms
                                    loginButtonText={verifySignUp ? 'Verify' : 'Log in'}
                                    withSignUpLink={!verifySignUp && !modal} />
                            </form>
                        </div>
                    </div>

                    {(!verifySignUp && !modal) && <SecretPhrase d={this.props.d} />}
                </div>
            </React.Fragment>
        );
    }
}

LoginPageBody.propTypes = {
    d: PropTypes.instanceOf(Driver),
    modal: PropTypes.bool,
    verifySignUp: PropTypes.bool,
    prevSignUpStep: PropTypes.func,
};
