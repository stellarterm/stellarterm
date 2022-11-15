import React from 'react';
import PropTypes from 'prop-types';
import images from './../../../../images';
import Driver from '../../../../lib/driver/Driver';


export default class SecretPhrase extends React.Component {
    constructor(props) {
        super(props);
        const secretPhrase = localStorage.getItem('security-phrase') || '';
        this.state = {
            isSecretPhraseMissing: !secretPhrase,
            secretPhrase,
        };
    }

    getSecretPhraseMainBlock() {
        const { isSecretPhraseMissing, secretPhrase } = this.state;
        if (isSecretPhraseMissing) {
            return (
                <React.Fragment>
                    <p className="SecretPhrase_title SecretPhrase_title-alert">
                        <img src={images['icon-warning-small-red']} alt="warn" className="SecretPhrase_img-blinking" />
                        Secret Phrase not found
                    </p>
                    <p className="SecretPhrase_content">
                        Secret Phrase can help you verify that you are using authentic StellarTerm website and
                         save you from phishing attacks.
                    </p>
                    <p
                        onClick={() => this.props.d.modal.handlers.activate(
                            'SecretPhraseSetup', () => this.handleUpdate())}
                        className="SecretPhrase_button"
                    >
                        Configure Secret Phrase
                        <img src={images['icon-arrow-right-green']} alt="->" />
                    </p>
                </React.Fragment>
            );
        }
        return (
            <React.Fragment>
                <p className="SecretPhrase_title">
                    <img src={images['icon-circle-success']} alt="warn" className="SecretPhrase_img-blinking" />
                    Make sure that your Secret Phrase is
                </p>
                <p className="SecretPhrase_phrase">
                    {secretPhrase}
                </p>
                <p className="SecretPhrase_description">
                    Secret Phrase could be missing if you access StellarTerm from a new device or a new browser.
                </p>
            </React.Fragment>
        );
    }

    handleUpdate() {
        const secretPhrase = localStorage.getItem('security-phrase') || '';
        this.setState({
            isSecretPhraseMissing: !secretPhrase,
            secretPhrase,
        });
    }

    render() {
        const mainBlock = this.getSecretPhraseMainBlock();
        return (
            <div className="SecretPhrase">
                {mainBlock}
                <br />
                <p className="SecretPhrase_title">Check the URL</p>
                <p className="SecretPhrase_content">Make sure you are on the correct website.</p>
                <div className="SecretPhrase_checkURL">
                    <img src={images['icon-lock-https']} alt="lock" />
                    <span className="green">https://</span><span>stellarterm.com</span>
                </div>
                <br />
                <p className="SecretPhrase_title">Keep your secret key secure</p>
                <p className="SecretPhrase_content">StellarTerm does not save your secret key.
                    It is stored on your browser and will be deleted once the page is refreshed or exited.
                </p>
            </div>
        );
    }
}
SecretPhrase.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
