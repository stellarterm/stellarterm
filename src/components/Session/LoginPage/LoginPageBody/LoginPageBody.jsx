import React from 'react';
import PropTypes from 'prop-types';
import * as StellarSdk from 'stellar-sdk';
import Driver from '../../../../lib/Driver';
import AcceptTerms from '../Common/AcceptTerms';
import LoginSecurityNotes from './LoginSecurityNotes/LoginSecurityNotes';
import images from '../../../../images';

export default class LoginPageBody extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            secretInput: '',
            invalidKey: false,
            show: false,
            isPublicKey: false,
        };
    }

    handleSubmit(event) {
        event.preventDefault();
        const secretKeyInput = this.state.secretInput;
        if (this.state.isPublicKey) {
            this.props.d.session.handlers.logInWithPublicKey(secretKeyInput);
        }

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
        this.setState({
            secretInput: event.target.value,
            isPublicKey: StellarSdk.StrKey.isValidEd25519PublicKey(event.target.value),
        });
    }

    checkForErrorMessages() {
        const isSetupError = this.props.d.session.setupError;
        const isInvalidKey = this.state.invalidKey;

        if (isInvalidKey) {
            return (
                <div className="s-alert s-alert--alert">
                    Invalid secret or public key. Hint: it starts with the letter S or G and is all uppercase
                </div>
            );
        } else if (isSetupError) {
            return (
                <div className="s-alert s-alert--alert">
                    Unable to contact network. Please check your internet connection and allow connections to
                    horizon.stellar.org. Maybe an adblocker or plugin (such as Privacy Badger) is preventing the client
                    from communicating with the network.
                </div>
            );
        }
        return null;
    }

    render() {
        const { show, isPublicKey } = this.state;
        const loginErrorMessage = this.checkForErrorMessages();
        const inputType = show ? 'text' : 'password';
        const toggleButtonIcon = show ? 'icon-eye' : 'icon-eye-hide';

        return (
            <div className="LoginPage__body">
                <div className="LoginPage__greenBox">
                    <div className="LoginPage__form">
                        <p className="LoginPage__intro">Log in with your secret or public key to manage your account</p>

                        <form onSubmit={e => this.handleSubmit(e)}>
                            <label className="s-inputGroup LoginPage__inputGroup" htmlFor="inputSecretKey">
                                <input
                                    name="inputSecretKey"
                                    type={inputType}
                                    className="s-inputGroup__item S-flexItem-share LoginPage__password"
                                    value={this.state.secretInput}
                                    maxLength={56}
                                    onChange={e => this.handleInput(e)}
                                    placeholder="Example:
                                        SDWN4ELCTO7KEJSM6OFGALEWYDK1JTCNF23CDCRVTZ3UYDH7FGSY....." />
                                <img
                                    src={images[toggleButtonIcon]}
                                    alt="show"
                                    className="LoginPage__show_icon"
                                    onClick={e => this.toggleShow(e)} />
                            </label>

                            {loginErrorMessage}
                            <AcceptTerms loginButtonText={isPublicKey ? 'Log in with public key' : 'Log in'} />
                        </form>
                    </div>
                    {!this.props.modal && <LoginSecurityNotes />}
                </div>
            </div>
        );
    }
}

LoginPageBody.propTypes = {
    d: PropTypes.instanceOf(Driver),
    modal: PropTypes.bool,
};
