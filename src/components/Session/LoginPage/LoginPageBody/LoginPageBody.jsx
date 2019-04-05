import React from 'react';
import PropTypes from 'prop-types';
import AcceptTerms from '../Common/AcceptTerms';
import Driver from '../../../../lib/Driver';
import LoginSecurityNotes from './LoginSecurityNotes/LoginSecurityNotes';

export default class LoginPageBody extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            secretInput: '',
            invalidKey: false,
            show: false,
        };
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
                <div className="s-alert s-alert--alert">
                    Invalid secret key. Hint: it starts with the letter S and is all uppercase
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
        const loginErrorMessage = this.checkForErrorMessages();
        const inputType = this.state.show ? 'text' : 'password';

        return (
            <div className="LoginPage__body">
                <div className="LoginPage__greenBox">
                    <div className="LoginPage__form">
                        <p className="LoginPage__intro">Log in with your secret key to manage your account.</p>

                        <form onSubmit={e => this.handleSubmit(e)}>
                            <label className="s-inputGroup LoginPage__inputGroup" htmlFor="inputSecretKey">
                                <input
                                    name="inputSecretKey"
                                    type={inputType}
                                    className="s-inputGroup__item S-flexItem-share LoginPage__password"
                                    value={this.state.secretInput}
                                    onChange={e => this.handleInput(e)}
                                    placeholder="Secret key (example:
                                        SBSMVCIWBL3HDB7N4EI3QKBKI4D5ZDSSDF7TMPB.....)" />

                                <div>
                                    <a
                                        className="LoginPage__show s-button s-button--light"
                                        onClick={e => this.toggleShow(e)}>
                                        Show
                                    </a>
                                </div>
                            </label>

                            {loginErrorMessage}
                            <AcceptTerms loginButtonText={'Log in'} />
                        </form>
                    </div>
                    <LoginSecurityNotes />
                </div>
            </div>
        );
    }
}

LoginPageBody.propTypes = {
    d: PropTypes.instanceOf(Driver),
};
