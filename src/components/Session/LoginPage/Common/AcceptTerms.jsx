import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

export default class AcceptTerms extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            termsAccepted: false,
        };
    }

    render() {
        return (
            <React.Fragment>
                <label className="s-inputGroup LoginPage__accept" htmlFor="inputAcceptCheckbox">
                    <input
                        id="inputAcceptCheckbox"
                        name="inputAcceptCheckbox"
                        className="LoginPage__accept__checkbox"
                        type="checkbox"
                        checked={this.state.termsAccepted}
                        onClick={() => this.setState({ termsAccepted: !this.state.termsAccepted })} />
                    <span className="LoginPage__accept__label">
                        I accept the{' '}
                        <Link to="/terms-of-use/" className="LoginPage__accept__link">
                            Terms of Use
                        </Link>
                        , understand the risks associated with cryptocurrencies, and know that StellarTerm does not
                        issue or endorse any asset on the Stellar network.
                    </span>
                </label>

                <input
                    type="submit"
                    className="LoginPage__generate s-button"
                    onClick={this.props.funcOnSubmit}
                    value={this.props.loginButtonText}
                    disabled={!this.state.termsAccepted} />
            </React.Fragment>
        );
    }
}

AcceptTerms.propTypes = {
    funcOnSubmit: PropTypes.func,
    loginButtonText: PropTypes.string.isRequired,
};
