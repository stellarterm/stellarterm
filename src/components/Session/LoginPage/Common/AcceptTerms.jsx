import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import isElectron from 'is-electron';

export default class AcceptTerms extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            termsAccepted: false,
        };
    }

    render() {
        const { withSignUpLink, loginButtonText, funcOnSubmit, loading } = this.props;
        return (
            <React.Fragment>
                <label className="LoginPage__accept" htmlFor="inputAcceptCheckbox">
                    <input
                        id="inputAcceptCheckbox"
                        name="inputAcceptCheckbox"
                        className="LoginPage__accept__checkbox"
                        type="checkbox"
                        checked={this.state.termsAccepted}
                        readOnly
                        onClick={() => this.setState({ termsAccepted: !this.state.termsAccepted })}
                    />
                    <span className="LoginPage__accept__label">
                        I accept the{' '}
                        <Link
                            to="/terms-of-use/"
                            className="LoginPage__accept__link"
                            target={isElectron() ? '_self' : '_blank'}
                        >
                            Terms of Use
                        </Link>
                        , understand the risks associated with cryptocurrencies, and know that StellarTerm does not
                        issue or endorse any asset on the Stellar network.
                    </span>
                </label>

                <div className="LoginPage_controls">
                    <button
                        className="LoginPage__button"
                        type="submit"
                        onClick={funcOnSubmit}
                        disabled={!this.state.termsAccepted}
                    >
                        {loginButtonText}
                        {loading &&
                            <div className="nk-spinner" />
                        }
                    </button>
                    {withSignUpLink && (
                        <span className="LoginPage__signupInvite">
                            Don&#39;t have an account? <Link to="/signup/">Create new account</Link>
                        </span>
                    )}
                </div>
            </React.Fragment>
        );
    }
}

AcceptTerms.propTypes = {
    funcOnSubmit: PropTypes.func,
    loginButtonText: PropTypes.string.isRequired,
    withSignUpLink: PropTypes.bool,
    loading: PropTypes.bool,
};
